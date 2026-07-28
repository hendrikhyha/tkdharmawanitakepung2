import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, BookHeart } from "lucide-react";

export const metadata = {
  title: "Lini Masa Kegiatan | Orang Tua Jurnal TK",
};

interface TimelineActivity {
  id: string;
  title: string;
  description: string | null;
  activity_date: string;
  activity_time: string | null;
  activity_photos: Array<{ id: string; image_url: string }>;
  activity_student_progress?: Array<{ student_id: string; notes: string }>;
}

export default async function ParentTimelinePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get parent -> children -> class_ids
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!parent) redirect("/parent");

  const { data: students } = await supabase
    .from("students")
    .select("id, class_id")
    .eq("parent_id", parent.id);

  const classIds = [...new Set((students || []).map((s) => s.class_id).filter(Boolean))] as string[];

  let activities: TimelineActivity[] = [];

  if (classIds.length > 0) {
    const { data } = await supabase
      .from("activities")
      .select(`
        id,
        title,
        description,
        activity_date,
        activity_time,
        activity_photos (
          id,
          image_url
        ),
        activity_student_progress (
          student_id,
          notes
        )
      `)
      .in("class_id", classIds)
      .eq("status", "PUBLISHED")
      .order("activity_date", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(50);

    const childrenIds = (students || []).map((s) => s.id);

    activities = ((data as any) || []).map((act: any) => ({
      ...act,
      activity_student_progress: act.activity_student_progress?.filter((p: any) =>
        childrenIds.includes(p.student_id)
      ),
    }));
  }

  // Group activities by date
  const grouped: Record<string, TimelineActivity[]> = {};
  for (const act of activities) {
    if (!grouped[act.activity_date]) {
      grouped[act.activity_date] = [];
    }
    grouped[act.activity_date].push(act);
  }

  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-sm shadow-pink-200">
          <BookHeart size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Lini Masa Kegiatan
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Jurnal kegiatan harian anak Anda yang telah diterbitkan oleh Guru.
          </p>
        </div>
      </div>

      {dateKeys.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-12 text-center backdrop-blur-md shadow-sm">
          <Clock className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <p className="text-base font-bold text-slate-600">
            Belum ada kegiatan yang diterbitkan
          </p>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Guru akan mengunggah jurnal kegiatan anak Anda segera.
          </p>
        </div>
      ) : (
        <div className="space-y-10 pl-2">
          {dateKeys.map((dateStr) => (
            <div key={dateStr}>
              {/* Date Header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 shadow-sm shadow-pink-300" />
                <h2 className="text-xl font-bold text-slate-700">
                  {format(new Date(dateStr), "EEEE, d MMMM yyyy", { locale: id })}
                </h2>
              </div>

              {/* Activities for this date */}
              <div className="relative border-l-2 border-pink-200 ml-2 pl-6 space-y-5">
                {grouped[dateStr].map((activity) => (
                  <div
                    key={activity.id}
                    className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-1"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-7 flex h-4 w-4 items-center justify-center rounded-full bg-white border-[3px] border-pink-400 shadow-sm" />

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-xl">
                        {activity.activity_time
                          ? activity.activity_time.slice(0, 5)
                          : "—"}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-800">
                      {activity.title}
                    </h3>

                    {activity.description && (
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed font-medium">
                        {activity.description}
                      </p>
                    )}

                    {/* Progress Preview */}
                    {activity.activity_student_progress && activity.activity_student_progress.length > 0 && (
                      <div className="mt-4 rounded-xl bg-pink-50/50 p-4 border border-pink-100">
                        <h4 className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">Catatan Perkembangan Anak</h4>
                        <div className="space-y-3">
                          {activity.activity_student_progress.map((progress, idx) => {
                            return (
                              <div key={idx} className="text-sm">
                                <p className="text-slate-600 leading-relaxed bg-white rounded-lg p-3 border border-pink-50">{progress.notes}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Photo grid */}
                    {activity.activity_photos.length > 0 && (
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {activity.activity_photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.image_url}
                              alt="Foto kegiatan anak"
                              className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
