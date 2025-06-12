
import { useEffect, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { useSpecieStore } from '../../store/specie-store';

type SpeciesSelectProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
};

const CREATE_NEW_OPTION_VALUE = '__CREATE_NEW__';

export default function SpeciesSelect({ value, onChange, error, helperText }: SpeciesSelectProps) {
  const { species, isLoading, fetchSpecies, createSpecie } = useSpecieStore();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSpecieName, setNewSpecieName] = useState('');

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value as string;
    if (selectedValue === CREATE_NEW_OPTION_VALUE) {
      setCreateDialogOpen(true);
    } else {
      onChange(selectedValue);
    }
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setNewSpecieName('');
  };

  const handleCreateSpecie = async () => {
    if (newSpecieName.trim()) {
      const newSpecie = await createSpecie({ name: newSpecieName.trim() });
      if (newSpecie) {
        onChange(newSpecie.id); // Selecciona automáticamente la nueva especie
        handleCloseDialog();
      }
    }
  };

  return (
    <>
      <FormControl fullWidth error={error}>
        <InputLabel id="specie-select-label">Especie de Pez</InputLabel>
        <Select
          labelId="specie-select-label"
          id="specie-select"
          value={value}
          label="Especie de Pez"
          onChange={handleSelectChange}
          renderValue={(selected) => {
            if (isLoading && !species.length) return "Cargando especies...";
            if (selected === "") return <em>Seleccione una especie</em>;
            const specie = species.find((s) => s.id === selected);
            return specie ? specie.name : '';
          }}
        >
          <MenuItem value="" disabled>
            <em>Seleccione una especie</em>
          </MenuItem>
          {isLoading && !species.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            species.map((specie) => (
              <MenuItem key={specie.id} value={specie.id}>
                {specie.name}
              </MenuItem>
            ))
          )}
          <MenuItem value={CREATE_NEW_OPTION_VALUE} sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            + Crear nueva especie...
          </MenuItem>
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {/* Dialogo para crear nueva especie */}
      <Dialog open={isCreateDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Crear Nueva Especie</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="new-specie-name"
            label="Nombre de la Especie"
            type="text"
            fullWidth
            variant="standard"
            value={newSpecieName}
            onChange={(e) => setNewSpecieName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSpecie()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleCreateSpecie} disabled={!newSpecieName.trim() || isLoading}>
            {isLoading ? <CircularProgress size={20} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}