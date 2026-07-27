"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useClasses, ClassData, useAcademicYears } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { classSchema, ClassFormValues } from "@/lib/validations/master";
import { createClass, updateClass, deleteClass } from "@/app/actions/master";

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

export default function ClassesTable() {
  const queryClient = useQueryClient();
  const { data: classes, isLoading, error } = useClasses();
  const { data: teachers } = useTeachers();
  const { data: academicYears } = useAcademicYears();

  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  
  const [isMutating, setIsMutating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const addForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: { name: "", teacher_id: "", academic_year_id: "" },
  });

  const editForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
  });

  const filteredClasses = classes?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const onAdd = async (values: ClassFormValues) => {
    setIsMutating(true);
    setServerError(null);
    const res = await createClass(values);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setIsAddOpen(false);
      addForm.reset();
    }
    setIsMutating(false);
  };

  const openEdit = (c: ClassData) => {
    setSelectedClass(c);
    editForm.reset({
      name: c.name,
      teacher_id: c.teacher_id ?? "",
      academic_year_id: c.academic_year_id ?? "",
    });
    setIsEditOpen(true);
  };

  const onEdit = async (values: ClassFormValues) => {
    if (!selectedClass) return;
    setIsMutating(true);
    setServerError(null);
    const res = await updateClass(selectedClass.id, values);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setIsEditOpen(false);
    }
    setIsMutating(false);
  };

  const openDelete = (c: ClassData) => {
    setSelectedClass(c);
    setIsDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!selectedClass) return;
    setIsMutating(true);
    const res = await deleteClass(selectedClass.id);
    
    if (!res.error) {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
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
            placeholder="Cari kelas..."
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
          Tambah Kelas
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Nama Kelas</TableHead>
              <TableHead className="text-white/60">Wali Kelas</TableHead>
              <TableHead className="text-white/60">Tahun Ajaran</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-white/40" />
                </TableCell>
              </TableRow>
            ) : filteredClasses?.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={4} className="h-32 text-center text-white/40">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses?.map((c) => (
                <TableRow key={c.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">{c.name}</TableCell>
                  <TableCell className="text-white/70">{c.teachers?.users.name || "-"}</TableCell>
                  <TableCell className="text-white/70">{c.academic_years?.name || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-white/10 bg-slate-900 text-white">
                        <DropdownMenuItem onClick={() => openEdit(c)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDelete(c)} className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer">
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
            <DialogTitle>Tambah Kelas</DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(onAdd)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Nama Kelas</Label>
              <Input id="name" {...addForm.register("name")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
              {addForm.formState.errors.name && <p className="text-xs text-red-400">{addForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Wali Kelas</Label>
              <Select onValueChange={(val: any) => addForm.setValue("teacher_id", val === "none" ? null : val)} defaultValue="none">
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {teachers?.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="focus:bg-white/10 focus:text-white">
                      {t.users.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Tahun Ajaran</Label>
              <Select onValueChange={(val: any) => addForm.setValue("academic_year_id", val === "none" ? null : val)} defaultValue="none">
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih tahun ajaran" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {academicYears?.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="focus:bg-white/10 focus:text-white">
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <DialogTitle>Edit Kelas</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white/80">Nama Kelas</Label>
              <Input id="edit-name" {...editForm.register("name")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Wali Kelas</Label>
              <Select onValueChange={(val: any) => editForm.setValue("teacher_id", val === "none" ? null : val)} defaultValue={selectedClass?.teacher_id ?? "none"}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {teachers?.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="focus:bg-white/10 focus:text-white">
                      {t.users.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Tahun Ajaran</Label>
              <Select onValueChange={(val: any) => editForm.setValue("academic_year_id", val === "none" ? null : val)} defaultValue={selectedClass?.academic_year_id ?? "none"}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-yellow-400/30">
                  <SelectValue placeholder="Pilih tahun ajaran" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white max-h-48">
                  <SelectItem value="none" className="text-white/40">-- Tidak ada --</SelectItem>
                  {academicYears?.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="focus:bg-white/10 focus:text-white">
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>Hapus Kelas</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Tindakan ini tidak dapat dibatalkan. Kelas <strong>{selectedClass?.name}</strong> akan dihapus permanen.
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
