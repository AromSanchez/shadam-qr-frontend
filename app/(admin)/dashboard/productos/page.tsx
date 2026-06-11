"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Search, Package, Edit, ImagePlus, X, Eye } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ─── Categorías estáticas ─── */
const STATIC_CATEGORIES = [
  { id: "entrada", name: "Entrada" },
  { id: "menu",    name: "Menú"    },
];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  image: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  imageFile: null as File | null,
  imagePreview: "",
};

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Edit state ─── */
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({ ...EMPTY_FORM });
  const [editUploading, setEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  /* ─────────────── fetch ─────────────── */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ─────────────── imagen ─────────────── */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5 MB");
      return;
    }
    const preview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, imagePreview: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─────────────── agregar producto ─────────────── */
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEntrada = formData.categoryId === "entrada";

    if (!formData.name.trim() || !formData.categoryId) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    if (!isEntrada && (!formData.price || Number(formData.price) < 0)) {
      toast.error("El precio debe ser un número positivo");
      return;
    }

    try {
      setUploading(true);

      const prodForm = new FormData();
      prodForm.append("nombre", formData.name.trim());
      prodForm.append("descripcion", formData.description.trim());
      prodForm.append("precio", isEntrada ? "0" : formData.price);
      prodForm.append("categoria", formData.categoryId.toUpperCase());
      
      if (formData.imageFile) {
        prodForm.append("imagen", formData.imageFile);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: prodForm, // Send form-data directly!
      });

      if (res.ok) {
        toast.success("Producto agregado correctamente");
        setIsAddDialogOpen(false);
        setFormData({ ...EMPTY_FORM });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear el producto");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setUploading(false);
    }
  };

  /* ─────────────── eliminar ─────────────── */
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto? Se eliminará también de los menús.")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Producto eliminado"); fetchData(); }
      else toast.error("Error al eliminar");
    } catch {
      toast.error("Error de conexión");
    }
  };

  /* ─────────────── editar ─────────────── */
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5 MB");
      return;
    }
    const preview = URL.createObjectURL(file);
    setEditFormData(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
  };

  const removeEditImage = () => {
    setEditFormData(prev => ({ ...prev, imageFile: null, imagePreview: "" }));
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price > 0 ? String(product.price) : "",
      categoryId: product.categoryId,
      imageFile: null,
      imagePreview: product.image || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const isEntradaEdit = editFormData.categoryId === "entrada";

    if (!editFormData.name.trim() || !editFormData.categoryId) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    if (!isEntradaEdit && (!editFormData.price || Number(editFormData.price) < 0)) {
      toast.error("El precio debe ser un número positivo");
      return;
    }

    try {
      setEditUploading(true);

      const prodForm = new FormData();
      prodForm.append("name", editFormData.name.trim());
      prodForm.append("description", editFormData.description.trim());
      prodForm.append("price", isEntradaEdit ? "0" : editFormData.price);
      prodForm.append("categoryId", editFormData.categoryId);

      if (editFormData.imageFile) {
        prodForm.append("imagen", editFormData.imageFile);
      }

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        body: prodForm,
      });

      if (res.ok) {
        toast.success("Producto actualizado correctamente");
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        setEditFormData({ ...EMPTY_FORM });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al actualizar el producto");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setEditUploading(false);
    }
  };

  /* ─────────────── ver detalle ─────────────── */
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryName = (id: string) =>
    STATIC_CATEGORIES.find(c => c.id === id)?.name ?? "Sin categoría";

  const isEntrada = formData.categoryId === "entrada";

  /* ───────────────────────── RENDER ───────────────────────── */
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Toaster richColors position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <Package className="text-primary" size={22} />
              <h1 className="text-2xl font-bold text-foreground">Gestión de Productos</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-8">Administra el catálogo de platos y bebidas</p>
          </div>

          {/* ──── DIALOG AGREGAR ──── */}
          <Dialog open={isAddDialogOpen} onOpenChange={(v) => {
            setIsAddDialogOpen(v);
            if (!v) setFormData({ ...EMPTY_FORM });
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus size={16} /> Nuevo Producto
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-primary">Agregar Producto</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddProduct} className="space-y-4 pt-2">

                {/* ── Zona de imagen ── */}
                <div className="space-y-1.5">
                  <Label>Imagen del producto</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  {formData.imagePreview ? (
                    /* previsualización */
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border group">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <X size={12} /> Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* zona de carga vacía */
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "w-full h-36 rounded-xl border-2 border-dashed border-border",
                        "flex flex-col items-center justify-center gap-2",
                        "text-muted-foreground hover:text-primary hover:border-primary",
                        "transition-colors cursor-pointer"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <ImagePlus size={20} />
                      </div>
                      <span className="text-sm font-medium">Haz clic para subir imagen</span>
                      <span className="text-[11px]">PNG, JPG o WEBP · máx 5 MB</span>
                    </button>
                  )}
                </div>

                {/* ── Nombre ── */}
                <div className="space-y-1.5">
                  <Label>Nombre del plato / bebida <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Ceviche de Pescado"
                  />
                </div>

                {/* ── Categoría + Precio ── */}
                <div className={cn("grid gap-4", isEntrada ? "grid-cols-1" : "grid-cols-2")}>
                  <div className="space-y-1.5">
                    <Label>Categoría <span className="text-destructive">*</span></Label>
                    <select
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value, price: "" })}
                    >
                      <option value="">Seleccionar...</option>
                      {STATIC_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Precio — solo si NO es Entrada */}
                  {!isEntrada && (
                    <div className="space-y-1.5">
                      <Label>Precio (S/) <span className="text-destructive">*</span></Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {/* Badge informativo si es entrada */}
                  {isEntrada && (
                    <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
                      💡 Las entradas son gratuitas, no requieren precio.
                    </p>
                  )}
                </div>

                {/* ── Descripción ── */}
                <div className="space-y-1.5">
                  <Label>Descripción</Label>
                  <textarea
                    className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground min-h-[72px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción del producto..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                >
                  {uploading ? "Guardando..." : "Guardar Producto"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar por nombre o descripción..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ══ MOBILE: cards ══ */}
        <div className="flex flex-col gap-3 md:hidden">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Cargando productos...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay productos registrados</p>
          ) : (
            filteredProducts.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 pt-4 pb-3 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center flex-shrink-0">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        : <Package size={20} className="text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {getCategoryName(p.categoryId)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-base text-foreground">
                      {p.price > 0 ? `S/ ${Number(p.price).toFixed(2)}` : "-"}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-border">
                    <span className="text-xs text-muted-foreground line-clamp-2">{p.description}</span>
                  </div>
                </div>
                <div className="flex border-t border-border divide-x divide-border">
                  <button
                    onClick={() => handleViewProduct(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Eye size={13} /> Ver Detalle
                  </button>
                  <button
                    onClick={() => openEditDialog(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Edit size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ══ DESKTOP: tabla ══ */}
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Listado de productos
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 w-[80px]">Imagen</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Producto</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoría</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Precio</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right pr-5">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Cargando productos...</TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No hay productos registrados</TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => (
                  <TableRow key={p.id} className="border-border hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-5">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          : <Package size={20} className="text-muted-foreground" />
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full",
                        p.categoryId === "entrada"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-primary/10 text-primary"
                      )}>
                        {getCategoryName(p.categoryId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {p.price > 0 ? `S/ ${Number(p.price).toFixed(2)}` : <span className="text-muted-foreground text-xs font-semibold">-</span>}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleViewProduct(p)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(p)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ──── DIALOG DETALLE PREMIUM ──── */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md bg-card border-border overflow-hidden rounded-2xl p-0 gap-0 shadow-elite animate-scale-in">
            {selectedProduct && (
              <div className="relative">
                {/* Imagen del Producto */}
                <div className="relative w-full h-64 bg-muted flex items-center justify-center overflow-hidden border-b border-border">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package size={48} className="stroke-[1.5]" />
                      <span className="text-xs">Sin imagen disponible</span>
                    </div>
                  )}
                  {/* Badge de Categoría */}
                  <span
                    className={cn(
                      "absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full shadow-md backdrop-blur-md",
                      selectedProduct.categoryId === "entrada"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-primary/95 text-white"
                    )}
                  >
                    {getCategoryName(selectedProduct.categoryId)}
                  </span>
                </div>

                {/* Contenido del Detalle */}
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">ID: {selectedProduct.id}</p>
                  </div>

                  {selectedProduct.description ? (
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descripción</span>
                      <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border">
                        {selectedProduct.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">Sin descripción registrada.</p>
                  )}

                  {/* Fila de Detalles Rápidos */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Precio</span>
                      <span className="font-mono font-extrabold text-lg text-foreground mt-0.5">
                        {selectedProduct.price > 0 ? `S/ ${Number(selectedProduct.price).toFixed(2)}` : "-"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Disponibilidad</span>
                      <span
                        className={cn(
                          "text-xs font-bold mt-1.5 flex items-center gap-1.5",
                          selectedProduct.available !== false ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full animate-pulse", selectedProduct.available !== false ? "bg-emerald-500" : "bg-red-500")} />
                        {selectedProduct.available !== false ? "Disponible" : "Agotado"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer del Modal */}
                <div className="px-6 py-4 bg-muted/40 border-t border-border flex justify-end">
                  <Button
                    onClick={() => setIsViewDialogOpen(false)}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg px-6"
                  >
                    Cerrar Vista
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ──── DIALOG EDITAR PRODUCTO ──── */}
        <Dialog open={isEditDialogOpen} onOpenChange={(v) => {
          setIsEditDialogOpen(v);
          if (!v) {
            setEditingProduct(null);
            setEditFormData({ ...EMPTY_FORM });
          }
        }}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-primary">Editar Producto</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditProduct} className="space-y-4 pt-2">

              {/* ── Zona de imagen ── */}
              <div className="space-y-1.5">
                <Label>Imagen del producto</Label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditImageSelect}
                />
                {editFormData.imagePreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border group">
                    <img
                      src={editFormData.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={removeEditImage}
                        className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                      >
                        <X size={12} /> Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className={cn(
                      "w-full h-36 rounded-xl border-2 border-dashed border-border",
                      "flex flex-col items-center justify-center gap-2",
                      "text-muted-foreground hover:text-primary hover:border-primary",
                      "transition-colors cursor-pointer"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <ImagePlus size={20} />
                    </div>
                    <span className="text-sm font-medium">Haz clic para subir imagen</span>
                    <span className="text-[11px]">PNG, JPG o WEBP - máx 5 MB</span>
                  </button>
                )}
              </div>

              {/* ── Nombre ── */}
              <div className="space-y-1.5">
                <Label>Nombre del plato / bebida <span className="text-destructive">*</span></Label>
                <Input
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Ej. Ceviche de Pescado"
                />
              </div>

              {/* ── Categoría + Precio ── */}
              <div className={cn("grid gap-4", editFormData.categoryId === "entrada" ? "grid-cols-1" : "grid-cols-2")}>
                <div className="space-y-1.5">
                  <Label>Categoría <span className="text-destructive">*</span></Label>
                  <select
                    className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={editFormData.categoryId}
                    onChange={e => setEditFormData({ ...editFormData, categoryId: e.target.value, price: "" })}
                  >
                    <option value="">Seleccionar...</option>
                    {STATIC_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {editFormData.categoryId !== "entrada" && (
                  <div className="space-y-1.5">
                    <Label>Precio (S/) <span className="text-destructive">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormData.price}
                      onChange={e => setEditFormData({ ...editFormData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                )}

                {editFormData.categoryId === "entrada" && (
                  <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
                    Las entradas son gratuitas, no requieren precio.
                  </p>
                )}
              </div>

              {/* ── Descripción ── */}
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <textarea
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground min-h-[72px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Breve descripción del producto..."
                />
              </div>

              <Button
                type="submit"
                disabled={editUploading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
              >
                {editUploading ? "Guardando..." : "Actualizar Producto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

