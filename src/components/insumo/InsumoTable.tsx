import type React from "react";
import { useEffect } from "react";
import { DataGrid, type GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useInsumoStore } from "../../store/useInsumoStore";
import { toast } from "react-toastify";

const InsumoTable: React.FC = () => {
  const { insumos, setActiveInsumo, deleteInsumo, error } = useInsumoStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEdit = (id: string) => {
    setActiveInsumo(id);
  };

  const handleDelete = async (id: string) => {
    toast.info(
      <div className="flex flex-col items-center gap-2">
        <p>¿Estás seguro de que deseas eliminar este insumo?</p>
        <div className="flex gap-2">
          <button
            className="rounded-lg font-extrabold bg-green-400 text-slate-600 p-2 w-24 whitespace-nowrap text-center"
            onClick={async () => {
              await deleteInsumo(id);
              toast.success("Insumo eliminado correctamente");
            }}
          >
            Eliminar
          </button>
          <button
            className="rounded-lg font-extrabold bg-red-400 text-slate-600 p-2 w-24 whitespace-nowrap text-center"
            onClick={() => toast.dismiss()}
          >
            Cancelar
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      }
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";

    try {
      const date = new Date(dateString + "Z");
      if (isNaN(date.getTime())) {
        console.error("Fecha inválida:", dateString);
        return "Fecha inválida";
      }
      return date.toLocaleDateString("es-ES", { timeZone: "UTC" });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error de formato";
    }
  };

  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      console.error("Valor inválido:", value);
      return "Valor no disponible";
    }

    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(value);
    } catch (error) {
      console.error("Error al formatear valor:", error);
      return "Error de formato";
    }
  };

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre del Insumo", flex: 1, minWidth: 180 },
    { field: "type", headerName: "Tipo", width: 120 },
    {
      field: "stage",
      headerName: "Etapa",
      width: 120,
      renderCell: (params) => {
        const tipo = params.row.type;
        const etapa = params.row.stage;
        // Solo mostrar la etapa si el tipo es "FOOD"
        return tipo === "FOOD" ? etapa : "No aplica";
      },
    },
    { field: "cantidad", headerName: "Cantidad", type: "number", width: 100 },
    { field: "presentacion", headerName: "Presentación", width: 150 },
    {
      field: "valor",
      headerName: "Valor",
      width: 130,
      renderCell: (params) => {
        const value = params.row.valor;
        if (value === null || value === undefined || isNaN(Number(value))) {
          return "Valor no disponible";
        }
        return formatCurrency(Number(value));
      },
    },
    {
      field: "fechaIngreso",
      headerName: "Fecha de Ingreso",
      width: 150,
      renderCell: (params) => {
        const value = params.row.fechaIngreso;
        if (!value) {
          return "Fecha no disponible";
        }
        return formatDate(String(value));
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={<FaEdit />}
          label="Editar"
          onClick={() => handleEdit(params.row.id)}
          color="primary"
        />,
        <GridActionsCellItem
          key={2}
          icon={<FaTrash />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
          color="error"
        />,
      ],
    },
  ];

  return (
    <Paper sx={{ height: 400, width: "100%", boxShadow: 3, borderRadius: 2 }}>
      <DataGrid
        rows={insumos}
        columns={columns}
        pageSizeOptions={[5, 10, 25, 100]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Paper>
  );
};

export default InsumoTable;