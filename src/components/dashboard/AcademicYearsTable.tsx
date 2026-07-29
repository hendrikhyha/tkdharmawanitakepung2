"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Edit, Trash, Loader2, CheckCircle2, Circle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAcademicYears, AcademicYearData } from "@/hooks/useClasses";
import { createAcademicYear, updateAcademicYear, deleteAcademicYear } from "@/app/actions/master";

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
import { Switch } from "@/components/ui/switch";

export default function AcademicYearsTable() {
  const queryClient = useQueryClient();
  const { data: academicYears, isLoading, error } = useAcademicYears();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYearData | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formIsActive, setFormIsActive] = useState(false);

  const [isMutating, setIsMutating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setFormName("");
    setFormIsActive(false);
    setServerError(null);
    setIsAddOpen(true);
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsMutating(true);
    setServerError(null);
    const res = await createAcademicYear(formName.trim(), formIsActive);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["academic_years"] });
      setIsAddOpen(false);
    }
    setIsMutating(false);
  };

  const openEdit = (ay: AcademicYearData) => {
    setSelectedAcademicYear(ay);
    setFormName(ay.name);
    setFormIsActive(ay.is_active);
    setServerError(null);
    setIsEditOpen(true);
  };

  const onEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcademicYear || !formName.trim()) return;

    setIsMutating(true);
    setServerError(null);
    const res = await updateAcademicYear(selectedAcademicYear.id, formName.trim(), formIsActive);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["academic_years"] });
      setIsEditOpen(false);
    }
    setIsMutating(false);
  };

  const openDelete = (ay: AcademicYearData) => {
    setSelectedAcademicYear(ay);
    setIsDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!selectedAcademicYear) return;
    setIsMutating(true);
    const res = await deleteAcademicYear(selectedAcademicYear.id);
    
    if (!res.error) {
      queryClient.invalidateQueries({ queryKey: ["academic_years"] });
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
           {/* Placeholder for search if needed */}
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          <Plus size={18} />
          Tambah Tahun Ajaran
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Nama Tahun Ajaran</TableHead>
              <TableHead className="text-white/60">Status</TableHead>
              <TableHead className="text-right text-white/60">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
                </TableCell>
              </TableRow>
            ) : academicYears?.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={3} className="h-24 text-center text-white/40">
                  Belum ada data tahun ajaran.
                </TableCell>
              </TableRow>
            ) : (
              academicYears?.map((ay) => (
                <TableRow key={ay.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{ay.name}</TableCell>
                  <TableCell>
                    {ay.is_active ? (
                      <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={14} /> Aktif
                      </span>
                    ) : (
                      <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40 border border-white/10">
                        <Circle size={14} /> Non-Aktif
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
                        <MoreHorizontal size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 border-white/10 bg-slate-900/95 backdrop-blur-xl">
                        <DropdownMenuItem onClick={() => openEdit(ay)} className="gap-2 text-white/80 focus:bg-white/10 focus:text-white cursor-pointer">
                          <Edit size={16} /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDelete(ay)} className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                          <Trash size={16} /> Hapus
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
        <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Tahun Ajaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={onAdd} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Nama Tahun Ajaran</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: 2025/2026"
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/30"
              />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-0.5">
                <Label className="text-base text-white">Status Aktif</Label>
                <p className="text-xs text-white/50">
                  Tandai tahun ajaran ini sebagai periode aktif saat ini.
                </p>
              </div>
              <Switch
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>
            {serverError && <p className="text-sm text-red-400">{serverError}</p>}
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {isMutating && <Loader2 size={16} className="animate-spin" />}
                Simpan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tahun Ajaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={onEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white/80">Nama Tahun Ajaran</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: 2025/2026"
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/30"
              />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-0.5">
                <Label className="text-base text-white">Status Aktif</Label>
                <p className="text-xs text-white/50">
                  Tandai tahun ajaran ini sebagai periode aktif saat ini.
                </p>
              </div>
              <Switch
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>
            {serverError && <p className="text-sm text-red-400">{serverError}</p>}
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {isMutating && <Loader2 size={16} className="animate-spin" />}
                Simpan Perubahan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="border-white/10 bg-slate-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tahun Ajaran?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Apakah Anda yakin ingin menghapus {selectedAcademicYear?.name}? Data yang terhubung dengan tahun ajaran ini mungkin akan terdampak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
