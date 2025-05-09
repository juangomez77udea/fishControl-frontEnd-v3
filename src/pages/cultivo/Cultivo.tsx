import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import {
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  Typography,
} from "@mui/material"

// Definición de tipos
type Lote = {
  id: string
  numeroLote: string
  cantidadAnimales: number
  fechaIngreso: string
  edadLote: number
}

type FormValues = {
  numeroLote: string
  cantidadAnimales: number
  fechaIngreso: string
  edadLote: number
}

export default function Cultivo() {
  // Estado para almacenar los lotes
  const [lotes, setLotes] = useState<Lote[]>([
    { id: "01", numeroLote: "001", cantidadAnimales: 90000, fechaIngreso: "01/02/2025", edadLote: 1 },
    { id: "02", numeroLote: "002", cantidadAnimales: 70000, fechaIngreso: "01/02/2025", edadLote: 1 },
  ])

  // Estado para el lote seleccionado
  const [selectedLote, setSelectedLote] = useState<string | null>(null)

  // Configuración del formulario
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      numeroLote: "",
      cantidadAnimales: 0,
      fechaIngreso: new Date().toISOString().split("T")[0],
      edadLote: 0,
    },
  })

  // Función para agregar un nuevo lote
  const onSubmit = (data: FormValues) => {
    const newLote: Lote = {
      id: (lotes.length + 1).toString().padStart(2, "0"),
      numeroLote: data.numeroLote,
      cantidadAnimales: data.cantidadAnimales,
      fechaIngreso: formatDate(data.fechaIngreso),
      edadLote: data.edadLote,
    }

    setLotes([...lotes, newLote])
    reset()
  }

  // Función para eliminar un lote
  const handleDeleteLote = () => {
    if (selectedLote) {
      setLotes(lotes.filter((lote) => lote.id !== selectedLote))
      setSelectedLote(null)
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Contenedor Superior - Formulario */}
      <Paper className="p-6 rounded-lg shadow-md">
        <Typography variant="h5" className="mb-4 font-bold">
          Gestión Lotes
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="numeroLote" className="font-medium">
              Número de Lote:
            </label>
            <Controller
              name="numeroLote"
              control={control}
              render={({ field }) => (
                <TextField {...field} id="numeroLote" placeholder="###" fullWidth variant="outlined" />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cantidadAnimales" className="font-medium">
              Cantidad de animales:
            </label>
            <Controller
              name="cantidadAnimales"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="cantidadAnimales"
                  type="number"
                  placeholder="Ingrese la cantidad animales"
                  fullWidth
                  variant="outlined"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="fechaIngreso" className="font-medium">
              Fecha
            </label>
            <Controller
              name="fechaIngreso"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="fechaIngreso"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="edadLote" className="font-medium">
              Edad del Lote:
            </label>
            <Controller
              name="edadLote"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="edadLote"
                  type="number"
                  placeholder="Ingrese la edad del lote"
                  fullWidth
                  variant="outlined"
                />
              )}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <Button type="submit" variant="contained" style={{ backgroundColor: "#3b82f6" }} className="px-4 py-2">
              Agregar lote
            </Button>
            <Button
              type="button"
              variant="contained"
              color="error"
              className="px-4 py-2"
              onClick={handleDeleteLote}
              disabled={!selectedLote}
            >
              Eliminar lote
            </Button>
          </div>
        </form>
      </Paper>

      {/* Contenedor Inferior - Tabla */}
      <Paper className="rounded-lg shadow-md overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Seleccionar</TableCell>
                <TableCell align="center">Id</TableCell>
                <TableCell align="center">Cantidad de Animales</TableCell>
                <TableCell align="center">Fecha de Ingreso</TableCell>
                <TableCell align="center">Edad del Lote</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lotes.map((lote) => (
                <TableRow key={lote.id}>
                  <TableCell align="center">
                    <Radio
                      checked={selectedLote === lote.id}
                      onChange={() => setSelectedLote(lote.id)}
                      value={lote.id}
                      name="lote-radio"
                    />
                  </TableCell>
                  <TableCell align="center">{lote.id}</TableCell>
                  <TableCell align="center">{lote.cantidadAnimales.toLocaleString()}</TableCell>
                  <TableCell align="center">{lote.fechaIngreso}</TableCell>
                  <TableCell align="center">{lote.edadLote}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
