"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2, KeyRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTeachers, TeacherData } from "@/hooks/useTeachers";
import { userSchema, userUpdateSchema, resetPasswordSchema, UserFormValues, UserUpdateFormValues, ResetPasswordFormValues } from "@/lib/validations/master";
import { createTeacher, updateTeacher, deleteTeacher, resetUserPassword } from "@/app/actions/master";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TeachersTable() {
  const queryClient = useQueryClient();
  const { data: teachers, isLoading, error } = useTeachers();

  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  
  const [isMutating, setIsMutating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const editForm = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const filteredTeachers = teachers?.filter((t) =>
    t.users.name.toLowerCase().includes(search.toLowerCase()) ||
    t.users.email.toLowerCase().includes(search.toLowerCase())
  );

  const onAdd = async (values: UserFormValues) => {
    setIsMutating(true);
    setServerError(null);
    const res = await createTeacher(values);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setIsAddOpen(false);
      addForm.reset();
    }
    setIsMutating(false);
  };

  const openEdit = (teacher: TeacherData) => {
    setSelectedTeacher(teacher);
    editForm.reset({
      name: teacher.users.name,
      email: teacher.users.email,
      phone: teacher.phone ?? "",
    });
    setIsEditOpen(true);
  };

  const onEdit = async (values: UserUpdateFormValues) => {
    if (!selectedTeacher) return;
    setIsMutating(true);
    setServerError(null);
    const res = await updateTeacher(selectedTeacher.id, selectedTeacher.user_id, values);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setIsEditOpen(false);
    }
    setIsMutating(false);
  };

  const openResetPassword = (teacher: TeacherData) => {
    setSelectedTeacher(teacher);
    setServerError(null);
    setResetSuccessMessage(null);
    resetPasswordForm.reset({ password: "" });
    setIsResetPasswordOpen(true);
  };

  const onResetPassword = async (values: ResetPasswordFormValues) => {
    if (!selectedTeacher) return;
    setIsMutating(true);
    setServerError(null);
    setResetSuccessMessage(null);

    const res = await resetUserPassword(selectedTeacher.user_id, values.password);

    if (res.error) {
      setServerError(res.error);
    } else {
      setResetSuccessMessage(`Password untuk ${selectedTeacher.users.name} berhasil diperbarui!`);
      setTimeout(() => {
        setIsResetPasswordOpen(false);
        setResetSuccessMessage(null);
      }, 1500);
    }
    setIsMutating(false);
  };

  const openDelete = (teacher: TeacherData) => {
    setSelectedTeacher(teacher);
    setIsDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!selectedTeacher) return;
    setIsMutating(true);
    const res = await deleteTeacher(selectedTeacher.id, selectedTeacher.user_id);
    
    if (!res.error) {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
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
            placeholder="Cari guru..."
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
          Tambah Guru
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Nama</TableHead>
              <TableHead className="text-white/60">Email</TableHead>
              <TableHead className="text-white/60">No. HP</TableHead>
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
            ) : filteredTeachers?.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={4} className="h-32 text-center text-white/40">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers?.map((teacher) => (
                <TableRow key={teacher.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">{teacher.users.name}</TableCell>
                  <TableCell className="text-white/70">{teacher.users.email}</TableCell>
                  <TableCell className="text-white/70">{teacher.phone || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-white/10 bg-slate-900 text-white">
                        <DropdownMenuItem onClick={() => openEdit(teacher)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetPassword(teacher)} className="focus:bg-yellow-500/20 focus:text-yellow-400 text-yellow-400 cursor-pointer">
                          <KeyRound className="mr-2 h-4 w-4" /> Ubah Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDelete(teacher)} className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer">
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
            <DialogTitle>Tambah Guru</DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(onAdd)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Nama Lengkap</Label>
              <Input id="name" {...addForm.register("name")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
              {addForm.formState.errors.name && <p className="text-xs text-red-400">{addForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input id="email" type="email" {...addForm.register("email")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
              {addForm.formState.errors.email && <p className="text-xs text-red-400">{addForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password (Opsional, default: password123)</Label>
              <Input id="password" type="password" placeholder="Kosongkan jika default" {...addForm.register("password")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
              {addForm.formState.errors.password && <p className="text-xs text-red-400">{addForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">No. HP (Opsional)</Label>
              <Input id="phone" {...addForm.register("phone")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
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
            <DialogTitle>Edit Data Guru</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white/80">Nama Lengkap</Label>
              <Input id="edit-name" {...editForm.register("name")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-white/80">Email</Label>
              <Input id="edit-email" type="email" {...editForm.register("email")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-white/80">No. HP</Label>
              <Input id="edit-phone" {...editForm.register("phone")} className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30" />
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

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Ubah Password Guru</DialogTitle>
          </DialogHeader>
          <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4 mt-4">
            <p className="text-sm text-white/60">
              Mengubah password untuk akun <strong>{selectedTeacher?.users.name}</strong> ({selectedTeacher?.users.email}).
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-password" className="text-white/80">Password Baru</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="Minimal 6 karakter"
                {...resetPasswordForm.register("password")}
                className="border-white/10 bg-white/5 text-white focus-visible:ring-yellow-400/30"
              />
              {resetPasswordForm.formState.errors.password && (
                <p className="text-xs text-red-400">{resetPasswordForm.formState.errors.password.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{serverError}</p>}
            {resetSuccessMessage && <p className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-xl">{resetSuccessMessage}</p>}
            <DialogFooter className="mt-6">
              <button type="submit" disabled={isMutating} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-50">
                {isMutating && <Loader2 size={16} className="animate-spin" />}
                Simpan Password Baru
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Guru</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Tindakan ini tidak dapat dibatalkan. Data guru <strong>{selectedTeacher?.users.name}</strong> akan dihapus permanen dari sistem.
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
