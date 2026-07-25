"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useStudents, StudentData } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useParents } from "@/hooks/useParents";
import { studentSchema, StudentFormValues } from "@/lib/validations/master";
import { createStudent, updateStudent, deleteStudent } from "@/app/actions/master";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StudentsTable() {
  const queryClient = useQueryClient();
  const { data: students, isLoading, error } = useStudents();
  const { data: classes } = useClasses();
  const { data: parents } = useParents();

  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  
  const [isMutating, setIsMutating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const addForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", class_id: "", parent_id: "", birth_date: "" },
  });

  const editForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  const filteredStudents = students?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const onAdd = async (values: StudentFormValues) => {
    setIsMutating(true);
    setServerError(null);
    const res = await createStudent(values);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsAddOpen(false);
      addForm.reset();
    }
    setIsMutating(false);
  };

  const openEdit = (s: StudentData) => {
    setSelectedStudent(s);
    editForm.reset({
      name: s.name,
      class_id: s.class_id ?? "",
      parent_id: s.parent_id ?? "",
      birth_date: s.birth_date ?? "",
    });
    setIsEditOpen(true);
  };

  const onEdit = async (values: StudentFormValues) => {
    if (!selectedStudent) return;
    setIsMutating(true);
    setServerError(null);
    const res = await updateStudent(selectedStudent.id, values);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditOpen(false);
    }
    setIsMutating(false);
  };

  const openDelete = (s: StudentData) => {
    setSelectedStudent(s);
    setIsDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!selectedStudent) return;
    setIsMutating(true);
    const res = await deleteStudent(selectedStudent.id);
    
    if (!res.error) {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsDeleteOpen(false);
    }
    setIsMutating(false);
  };

  if (error) return <div className="text-red-400">Error loading data.</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Cari siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40 focus-visible:ring-yellow-400/30"
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-yellow-900 transition hover:bg-yellow-300 active:scale-95"
        >
          <Plus size={16} />
          Tambah Siswa
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Nama Siswa</TableHead>
              <TableHead className="text-white/60">Kelas</TableHead>
              <TableHead className="text-white/60">Orang Tua</TableHead>
              <TableHead className="text-white/60">Tgl. Lahir</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-white/40" />
                </TableCell>
              </TableRow>
            ) : filteredStudents?.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="h-32 text-center text-white/40">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents?.map((s) => (
                <TableRow key={s.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">{s.name}</TableCell>
                  <TableCell className="text-white/70">{s.classes?.name || "-"}</TableCell>
                  <TableCell className="text-white/70">{s.parents?.users.name || "-"}</TableCell>
                  <TableCell className="text-white/70">{s.birth_date || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-white/10 bg-slate-900 text-white">
                        <DropdownMenuItem onClick={() => openEdit(s)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDelete(s)} className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer">
                          <Trash className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Tambah Siswa</DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(onAdd)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Nama Lengkap</Label>
              <Input id="name" {...addForm.register("name")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
              {addForm.formState.errors.name && <p className="text-xs text-red-400">{addForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Kelas</Label>
              <Select onValueChange={(val) => addForm.setValue("class_id", val === "none" ? null : val)} defaultValue="none">
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Orang Tua</Label>
              <Select onValueChange={(val) => addForm.setValue("parent_id", val === "none" ? null : val)} defaultValue="none">
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih orang tua" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {parents?.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-white/10 focus:text-white">
                      {p.users.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date" className="text-white/80">Tanggal Lahir (Opsional)</Label>
              <Input id="birth_date" type="date" {...addForm.register("birth_date")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30 [color-scheme:dark]" />
            </div>
            {serverError && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{serverError}</p>}
            <DialogFooter className="mt-6">
              <button type="submit" disabled={isMutating} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-50">
                {isMutating && <Loader2 size={16} className="animate-spin" />}
                Simpan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Siswa</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white/80">Nama Lengkap</Label>
              <Input id="edit-name" {...editForm.register("name")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Kelas</Label>
              <Select onValueChange={(val) => editForm.setValue("class_id", val === "none" ? null : val)} defaultValue={selectedStudent?.class_id ?? "none"}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Orang Tua</Label>
              <Select onValueChange={(val) => editForm.setValue("parent_id", val === "none" ? null : val)} defaultValue={selectedStudent?.parent_id ?? "none"}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih orang tua" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {parents?.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-white/10 focus:text-white">
                      {p.users.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birth" className="text-white/80">Tanggal Lahir</Label>
              <Input id="edit-birth" type="date" {...editForm.register("birth_date")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30 [color-scheme:dark]" />
            </div>
            {serverError && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{serverError}</p>}
            <DialogFooter className="mt-6">
              <button type="submit" disabled={isMutating} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-50">
                {isMutating && <Loader2 size={16} className="animate-spin" />}
                Simpan Perubahan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Siswa</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Tindakan ini tidak dapat dibatalkan. Siswa <strong>{selectedStudent?.name}</strong> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isMutating} className="bg-red-500 hover:bg-red-600 text-white">
              {isMutating ? <Loader2 size={16} className="animate-spin" /> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
