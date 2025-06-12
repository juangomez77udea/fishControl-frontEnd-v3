// src/components/Cultivo.tsx

import { useEffect, useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  CircularProgress,
} from "@mui/material"
import { useBatchStore } from "../../store/batch-store"
import { useAuthStore } from "../../store/useAuthStore"
import { toast } from "react-toastify"
import SpeciesSelect from "../../components/Species/SpeciesSelect"
import { useSpecieStore } from "../../store/specie-store"

type FormValues = {
  quantityAnimals: number
  averageWeight: number
  entryDate: string
  batchAge: number
  specieId: string
}

type EnrichedBatch = {
  id: string
  specieId: string
  specieName: string
  quantityAnimals: number
  averageWeight: number
  entryDate: string
  batchAge: number
  animalsRemoved: number
}

export default function Cultivo() {
  const { isAuthenticated } = useAuthStore()
  const { batches, selectedBatchId, isLoading, error, fetchBatches, selectBatch, createBatch, deleteBatch } = useBatchStore()
  const { species, fetchSpecies } = useSpecieStore();
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      quantityAnimals: 0,
      averageWeight: 0,
      entryDate: new Date().toISOString().split("T")[0],
      batchAge: 0,
      specieId: "",
    },
    mode: "onBlur",
  })

  useEffect(() => {
    if (isAuthenticated && !hasAttemptedLoad) {
      fetchBatches();
      fetchSpecies();
      setHasAttemptedLoad(true);
    }
  }, [isAuthenticated, fetchBatches, fetchSpecies, hasAttemptedLoad])

  const enrichedBatches = useMemo(() => {
    // Siempre devolver un array de EnrichedBatch, incluso si species no está cargado
    const speciesMap = new Map(species.map(s => [s.id, s.name]));
    return batches.map(batch => ({
      ...batch,
      specieName: speciesMap.get(batch.specieId) || `Especie ID: ${batch.specieId} (No encontrada)`,
    }));
  }, [batches, species]);

  const onSubmit = (data: FormValues) => {

    if (!data.specieId) {
      toast.error("El campo de especie no debe quedar vacío.");
      return;
    }

    if (!data.quantityAnimals || data.quantityAnimals <= 0) {
      toast.error("La cantidad de animales es obligatoria y debe ser mayor a 0")
      return
    }
    if (!data.averageWeight || data.averageWeight <= 0) {
      toast.error("El peso promedio por animal es obligatorio y debe ser mayor a 0")
      return
    }
    if (!data.entryDate) {
      toast.error("La fecha de ingreso es obligatoria")
      return
    }
    if (data.batchAge === null || data.batchAge < 0) {
      toast.error("La edad del lote es obligatoria y no puede ser negativa")
      return
    }

    const selectedSpecie = species.find(s => s.id === data.specieId);

    createBatch({
      quantityAnimals: data.quantityAnimals,
      averageWeight: data.averageWeight,
      entryDate: data.entryDate,
      batchAge: data.batchAge,
      specieName: selectedSpecie?.name || "",
      animalsRemoved: 0,
      specieId: data.specieId,
    })

    reset()
  }

  const handleDeleteBatch = () => {
    if (selectedBatchId) {
      deleteBatch(selectedBatchId)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Gestión Lotes</h2>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className=" flex flex-col gap-2">
            <label htmlFor="spicie" className="font-medium text-gray-700">Especie</label>
            <Controller
              name="specieId"
              control={control}
              rules={{ required: "El campo de especie no debe quedar vacío" }}
              render={({ field, fieldState: { error } }) => (
                <SpeciesSelect
                  value={field.value}
                  onChange={field.onChange}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="quantityAnimals" className="font-medium text-gray-700">
              Cantidad de animales:
            </label>
            <Controller
              name="quantityAnimals"
              control={control}
              rules={{
                required: "La cantidad es obligatoria",
                min: { value: 1, message: "La cantidad debe ser mayor a 0" },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} id="quantityAnimals" type="number" fullWidth variant="outlined" error={!!error} helperText={error?.message} />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="averageWeight" className="font-medium text-gray-700">
              Peso promedio por animal:
            </label>
            <Controller
              name="averageWeight"
              control={control}
              rules={{
                required: "El peso promedio es obligatorio",
                min: { value: 0.01, message: "El peso debe ser mayor a 0" },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} id="averageWeight" type="number" fullWidth variant="outlined" error={!!error} helperText={error?.message} />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="entryDate" className="font-medium text-gray-700">
              Fecha de Ingreso
            </label>
            <Controller
              name="entryDate"
              control={control}
              rules={{ required: "La fecha de ingreso es obligatoria" }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} id="entryDate" type="date" fullWidth variant="outlined" error={!!error} helperText={error?.message} InputLabelProps={{ shrink: true }} />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="batchAge" className="font-medium text-gray-700">
              Edad del Lote (días):
            </label>
            <Controller
              name="batchAge"
              control={control}
              rules={{
                required: "La edad del lote es obligatoria",
                min: { value: 0, message: "La edad no puede ser negativa" },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} id="batchAge" type="number" fullWidth variant="outlined" error={!!error} helperText={error?.message} />
              )}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Agregando..." : "Agregar Lote"}
            </button>
            <button
              type="button"
              className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-bold ${!selectedBatchId || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleDeleteBatch}
              disabled={!selectedBatchId || isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar Lote"}
            </button>
          </div>
        </form>
      </div>

      {/* Contenedor Inferior - Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {isLoading && !batches.length && (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
          </div>
        )}

        {error && <div className="p-4 text-center text-red-500">{error}</div>}

        {!isLoading || batches.length > 0 ? (
          <TableContainer className="w-full">
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell align="center" className="font-semibold">Seleccionar</TableCell>
                  <TableCell align="center" className="font-semibold">Id</TableCell>
                  <TableCell align="center" className="font-semibold">Especie</TableCell>
                  <TableCell align="center" className="font-semibold">Cantidad</TableCell>
                  <TableCell align="center" className="font-semibold">Peso Promedio (gr)</TableCell>
                  <TableCell align="center" className="font-semibold">Fecha Ingreso</TableCell>
                  <TableCell align="center" className="font-semibold">Edad Lote (días)</TableCell>
                  <TableCell align="center" className="font-semibold">Removidos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-8">
                      No hay lotes disponibles. ¡Crea uno para empezar!
                    </TableCell>
                  </TableRow>
                ) : (
                  enrichedBatches.map((batch: EnrichedBatch) => (
                    <TableRow
                      key={batch.id}
                      className={selectedBatchId === batch.id ? "bg-blue-50" : "hover:bg-gray-50"}
                    >
                      <TableCell align="center">
                        <Radio
                          checked={selectedBatchId === batch.id}
                          onChange={() => selectBatch(batch.id)}
                          value={batch.id}
                          name="batch-radio"
                        />
                      </TableCell>
                      <TableCell align="center">{batch.id}</TableCell>
                      <TableCell align="center">{batch.specieName || 'N/A'}</TableCell>
                      <TableCell align="center">{batch.quantityAnimals.toLocaleString()}</TableCell>
                      <TableCell align="center">{batch.averageWeight.toFixed(2)}</TableCell>
                      <TableCell align="center">{batch.entryDate}</TableCell>
                      <TableCell align="center">{batch.batchAge}</TableCell>
                      <TableCell align="center">{batch.animalsRemoved}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </div>
    </div>
  )
}