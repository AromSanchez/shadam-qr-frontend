"use client";

import { useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    TrendingUp,
    Users,
    DollarSign,
    Utensils,
} from "lucide-react";

interface Consumo {
    id: number;
    fecha: string;
    tipo: "Externo" | "Pensionista";
    cliente: string;
    detalle: string;
    monto: number;
    meal: "Desayuno" | "Almuerzo" | "Cena" | null;
}

const consumosData: Consumo[] = [
    {
        id: 1,
        fecha: "2026-04-02",
        tipo: "Externo",
        cliente: "Mesa 5",
        detalle: "Menú S/12",
        monto: 12,
        meal: null,
    },
    {
        id: 2,
        fecha: "2026-04-02",
        tipo: "Pensionista",
        cliente: "Carlos Méndez",
        detalle: "Almuerzo",
        monto: 8,
        meal: "Almuerzo",
    },
    {
        id: 3,
        fecha: "2026-04-02",
        tipo: "Externo",
        cliente: "Mesa 2",
        detalle: "Menú S/15",
        monto: 15,
        meal: null,
    },
    {
        id: 4,
        fecha: "2026-04-02",
        tipo: "Pensionista",
        cliente: "María López",
        detalle: "Desayuno",
        monto: 5,
        meal: "Desayuno",
    },
    {
        id: 5,
        fecha: "2026-04-01",
        tipo: "Pensionista",
        cliente: "Jorge Díaz",
        detalle: "Cena",
        monto: 8,
        meal: "Cena",
    },
    {
        id: 6,
        fecha: "2026-04-01",
        tipo: "Externo",
        cliente: "Mesa 8",
        detalle: "Menú S/12",
        monto: 24,
        meal: null,
    },
    {
        id: 7,
        fecha: "2026-04-01",
        tipo: "Pensionista",
        cliente: "Patricia Rodríguez",
        detalle: "Almuerzo",
        monto: 8,
        meal: "Almuerzo",
    },
    {
        id: 8,
        fecha: "2026-04-01",
        tipo: "Externo",
        cliente: "Mesa 3",
        detalle: "Menú S/18",
        monto: 18,
        meal: null,
    },
    {
        id: 9,
        fecha: "2026-03-31",
        tipo: "Pensionista",
        cliente: "Luis Guerrero",
        detalle: "Cena",
        monto: 8,
        meal: "Cena",
    },
    {
        id: 10,
        fecha: "2026-03-31",
        tipo: "Externo",
        cliente: "Mesa 7",
        detalle: "Menú S/15",
        monto: 15,
        meal: null,
    },
];

export default function Consumos() {
    const [filterType, setFilterType] = useState("all");
    const [filterDate, setFilterDate] = useState("");
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        return consumosData.filter((c) => {
            if (filterType !== "all" && c.tipo !== filterType) return false;
            if (filterDate && c.fecha !== filterDate) return false;
            if (
                search &&
                !c.cliente.toLowerCase().includes(search.toLowerCase())
            )
                return false;
            return true;
        });
    }, [filterType, filterDate, search]);

    // Cálculos de estadísticas
    const stats = useMemo(() => {
        const totalMonto = filtered.reduce((sum, c) => sum + c.monto, 0);
        const totalPensionistas = filtered.filter(
            (c) => c.tipo === "Pensionista"
        ).length;
        const totalExternos = filtered.filter((c) => c.tipo === "Externo").length;
        const promedio = filtered.length > 0 ? totalMonto / filtered.length : 0;

        return {
            totalMonto,
            totalPensionistas,
            totalExternos,
            promedio,
            total: filtered.length,
        };
    }, [filtered]);

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Consumos
                </h1>
                <p className="text-sm md:text-base text-slate-600">
                    Registro detallado de todos los consumos y transacciones
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" style={{ color: "#aa4918" }} />
                            Total de Venta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">S/ {stats.totalMonto.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stats.total} transacciones
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Users className="h-4 w-4" style={{ color: "#aa4918" }} />
                            Pensionistas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPensionistas}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            S/ {filtered
                                .filter((c) => c.tipo === "Pensionista")
                                .reduce((sum, c) => sum + c.monto, 0)
                                .toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Utensils className="h-4 w-4" style={{ color: "#aa4918" }} />
                            Externos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalExternos}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            S/ {filtered
                                .filter((c) => c.tipo === "Externo")
                                .reduce((sum, c) => sum + c.monto, 0)
                                .toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" style={{ color: "#aa4918" }} />
                            Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            S/ {stats.promedio.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">por transacción</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 text-sm border-slate-200"
                        />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-40 h-10 text-sm border-slate-200">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Externo">Externo</SelectItem>
                            <SelectItem value="Pensionista">Pensionista</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full sm:w-44 h-10 text-sm border-slate-200"
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-200 pb-4">
                    <CardTitle className="text-lg">Historial de Consumos</CardTitle>
                    <CardDescription>
                        {filtered.length} consumos encontrados
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-200">
                                <TableRow className="hover:bg-slate-50">
                                    <TableHead className="text-xs font-semibold text-slate-700 h-12">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-700 h-12">
                                        Tipo
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-700 h-12">
                                        Cliente
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-700 h-12 hidden md:table-cell">
                                        Detalle
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-700 h-12 hidden lg:table-cell">
                                        Comida
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                                        Monto
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length > 0 ? (
                                    filtered.map((c) => (
                                        <TableRow
                                            key={c.id}
                                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell className="text-sm text-slate-700 font-medium py-3">
                                                {new Date(c.fecha).toLocaleDateString("es-PE", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge
                                                    variant={
                                                        c.tipo === "Pensionista" ? "secondary" : "outline"
                                                    }
                                                    className={
                                                        c.tipo === "Pensionista"
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "border-orange-200 text-orange-700"
                                                    }
                                                >
                                                    {c.tipo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-slate-900 py-3">
                                                {c.cliente}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 py-3 hidden md:table-cell">
                                                {c.detalle}
                                            </TableCell>
                                            <TableCell className="py-3 hidden lg:table-cell">
                                                {c.meal ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-slate-200 text-slate-700"
                                                    >
                                                        {c.meal}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right py-3">
                                                <span
                                                    className="font-mono font-semibold text-sm"
                                                    style={{ color: "#aa4918" }}
                                                >
                                                    S/ {c.monto.toFixed(2)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <p className="text-sm text-slate-500">
                                                No hay consumos que coincidan con los filtros
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="md:hidden space-y-3 p-4">
                        {filtered.length > 0 ? (
                            filtered.map((c) => (
                                <div
                                    key={c.id}
                                    className="border border-slate-200 rounded-2xl p-4 shadow-sm bg-white"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-slate-500">Fecha</p>
                                            <p className="font-medium text-slate-900">
                                                {new Date(c.fecha).toLocaleDateString("es-PE", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                c.tipo === "Pensionista" ? "secondary" : "outline"
                                            }
                                            className={
                                                c.tipo === "Pensionista"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : "border-orange-200 text-orange-700"
                                            }
                                        >
                                            {c.tipo}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Cliente</p>
                                            <p className="font-medium text-slate-900">{c.cliente}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Monto</p>
                                            <p className="font-mono font-semibold text-slate-900" style={{ color: "#aa4918" }}>
                                                S/ {c.monto.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 mt-4 text-sm text-slate-600">
                                        <div>
                                            <p className="text-xs text-slate-500">Detalle</p>
                                            <p>{c.detalle}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Comida</p>
                                            <p>
                                                {c.meal ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-slate-200 text-slate-700"
                                                    >
                                                        {c.meal}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
                                No hay consumos que coincidan con los filtros
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
