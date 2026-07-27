import { createClient } from "@/utils/supabase/server";

export type AttendanceRecord = {
  id: string;
  class_id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: "PRESENT" | "SICK" | "EXCUSED" | "ABSENT";
  note: string | null;
  students?: {
    name: string;
  };
};

export async function getAttendanceByDate(classId: string, date: string): Promise<AttendanceRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attendances")
    .select(`
      *,
      students (
        name
      )
    `)
    .eq("class_id", classId)
    .eq("date", date);

  if (error || !data) {
    console.error("Error fetching attendance:", error);
    return [];
  }

  return data as AttendanceRecord[];
}

export async function getAttendanceReport(classId: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attendances")
    .select(`
      *,
      students (
        name
      )
    `)
    .eq("class_id", classId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error || !data) {
    console.error("Error fetching attendance report:", error);
    return [];
  }

  return data as AttendanceRecord[];
}

export async function getStudentAttendance(studentId: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attendances")
    .select("*")
    .eq("student_id", studentId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error || !data) {
    console.error("Error fetching student attendance:", error);
    return [];
  }

  return data as AttendanceRecord[];
}
