import React from "react";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useInsumoStore } from "../../store/useInsumoStore";
import { toast } from "react-toastify";

const InsumoTable: React.FC = () => {
  const { insumos, setActiveInsumo, deleteInsumo } = useInsumoStore();

  const handleEdit = (id: string) => {
    setActiveInsumo(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este insumo?")) {
      deleteInsumo(id);
      toast.error("Insumo eliminado");
    }
  };

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre del Insumo", flex: 1, minWidth: 180 },
    { field: "cantidad", headerName: "Cantidad", type: "number", width: 100 },
    { field: "presentacion", headerName: "Presentación", width: 150 },
    { field: "valor", headerName: "Valor", type: "number", width: 130 },
    { field: "fechaIngreso", headerName: "Fecha de Ingreso", width: 150 },
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