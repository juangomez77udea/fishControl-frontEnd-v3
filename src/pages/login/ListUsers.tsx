import { useEffect } from "react"
import { DataGrid, type GridColDef, GridActionsCellItem } from "@mui/x-data-grid"
import Paper from "@mui/material/Paper"
import { FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa"
import { toast } from "react-toastify"
import { useUserStore } from "../../store/useUserStore"
import { useAuthStore } from "../../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import type { User } from "../../types/user"

const ListUsers = () => {
  const { users, isLoading, error, fetchUsers, enableUser, disableUser, removeUser } = useUserStore()
  const isAdmin = useAuthStore((state) => state.hasRole("ROLE_ADMIN"))
  const navigate = useNavigate()

  // Verificar si el usuario es administrador al cargar el componente
  useEffect(() => {
    if (!isAdmin) {
      navigate("/insumos")
      toast.error("No tienes permisos para acceder a esta página", { theme: "dark" })
    } else {
      fetchUsers()
    }
  }, [isAdmin, navigate, fetchUsers])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await disableUser(id)
        toast.success("Usuario desactivado correctamente")
      } else {
        await enableUser(id)
        toast.success("Usuario activado correctamente")
      }
    } catch {
      toast.error("Error al cambiar el estado del usuario")
    }
  }

  const handleDelete = (id: number, username: string) => {
    toast.info(
      <div className="flex flex-col items-center gap-2">
        <p>
          ¿Estás seguro de que deseas eliminar al usuario <strong>{username}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            className="rounded-lg font-extrabold bg-green-400 text-slate-600 p-2 w-24 whitespace-nowrap text-center"
            onClick={async () => {
              try {
                await removeUser(id)
                toast.success("Usuario eliminado correctamente")
              } catch {
                toast.error("Error al eliminar el usuario")
              }
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
      },
    )
  }

  // Función para renderizar los roles de usuario
  const renderRoles = (roles: unknown): string => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return "Sin roles"

    return roles
      .map((role) => {
        // Manejar diferentes formatos de roles
        let roleName: string

        if (typeof role === "string") {
          // Eliminar el prefijo "ROLE_" si existe
          roleName = role.replace(/^ROLE_/i, "")
        } else if (typeof role === "object" && role !== null) {
          // Si es un objeto, intentar obtener la propiedad 'name'
          roleName = (role as { name?: string }).name || "Desconocido"
        } else {
          return "Desconocido"
        }

        // Formatear el nombre del rol (primera letra mayúscula, resto minúsculas)
        return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase()
      })
      .join(", ")
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "username", headerName: "Nombre de Usuario", flex: 1, minWidth: 180 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "roles",
      headerName: "Roles",
      width: 150,
      renderCell: (params) => {
        return renderRoles(params.row.roles)
      },
    },
    {
      field: "enabled",
      headerName: "Estado",
      width: 120,
      renderCell: (params) => {
        const enabled = params.row.enabled
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {enabled ? "Activo" : "Inactivo"}
          </span>
        )
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 150,
      getActions: (params) => {
        const user = params.row as User
        return [
          <GridActionsCellItem
            key="toggle"
            icon={user.enabled ? <FaToggleOff /> : <FaToggleOn />}
            label={user.enabled ? "Desactivar" : "Activar"}
            onClick={() => handleToggleStatus(user.id, user.enabled)}
            showInMenu
          />,
          <GridActionsCellItem
            key="delete"
            icon={<FaTrash />}
            label="Eliminar"
            onClick={() => handleDelete(user.id, user.username)}
            color="error"
            showInMenu
          />,
        ]
      },
    },
  ]

  // Si no es administrador, no renderizar el componente
  if (!isAdmin) {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Usuarios</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Paper sx={{ height: 400, width: "100%", boxShadow: 3, borderRadius: 2 }}>
          <DataGrid
            rows={users}
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
      )}
    </div>
  )
}

export default ListUsers