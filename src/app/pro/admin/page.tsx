"use client";

import { useState, useEffect } from 'react';
import { requireAdmin } from '@/lib/auth-utils';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { 
  People, 
  Home, 
  Add, 
  Search, 
  Edit, 
  Delete, 
  Save, 
  Cancel,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { 
  Tabs, 
  Tab, 
  Box, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { UserOutput, getAllUsers, createUser, updateUser, deleteUser } from '@/actions/db/user.action';
import { InteriorOutput, getAllInteriorsAdmin, createInterior, updateInterior, deleteInterior } from '@/actions/db/admin-interior.action';
import { getAllTypeInteriors } from '@/actions/db/typeInterior.action';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<UserOutput[]>([]);
  const [interiors, setInteriors] = useState<InteriorOutput[]>([]);
  const [typeInteriors, setTypeInteriors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // User modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOutput | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'AGENT' as 'AGENT' | 'ADMIN',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Interior modal state
  const [interiorModalOpen, setInteriorModalOpen] = useState(false);
  const [selectedInterior, setSelectedInterior] = useState<InteriorOutput | null>(null);
  const [interiorForm, setInteriorForm] = useState({
    title: '',
    listImages: '',
    typeId: 1,
    furniture: false,
    unfurnished: false,
    description: '',
    stockage: 0,
    rooms: 0,
    bedRooms: 0,
    floor: 0,
    parkingSpots: 0,
    displayed: true,
    minRentalPrice: 0,
    maxRentalPrice: 0,
    minPurchasePrice: 0,
    maxPurchasePrice: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, interiorsData, typesData] = await Promise.all([
        getAllUsers(),
        getAllInteriorsAdmin(),
        getAllTypeInteriors()
      ]);
      setUsers(usersData);
      setInteriors(interiorsData);
      setTypeInteriors(typesData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm('');
  };

  // User functions
  const openUserModal = (user?: UserOutput) => {
    setSelectedUser(user || null);
    setUserForm({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'AGENT',
      password: ''
    });
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    setUserModalOpen(false);
    setSelectedUser(null);
    setUserForm({ name: '', email: '', role: 'AGENT', password: '' });
    setShowPassword(false);
  };

  const handleUserSubmit = async () => {
    try {
      setError('');
      if (selectedUser) {
        await updateUser(selectedUser.id, userForm);
      } else {
        await createUser(userForm);
      }
      await loadData();
      closeUserModal();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(userId);
        await loadData();
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Interior functions
  const openInteriorModal = (interior?: InteriorOutput) => {
    setSelectedInterior(interior || null);
    setInteriorForm({
      title: interior?.title || '',
      listImages: interior?.listImages || '',
      typeId: interior?.typeId || (typeInteriors[0]?.id || 1),
      furniture: interior?.furniture || false,
      unfurnished: interior?.unfurnished || false,
      description: interior?.description || '',
      stockage: interior?.stockage || 0,
      rooms: interior?.rooms || 0,
      bedRooms: interior?.bedRooms || 0,
      floor: interior?.floor || 0,
      parkingSpots: interior?.parkingSpots || 0,
      displayed: interior?.displayed ?? true,
      minRentalPrice: interior?.minRentalPrice || 0,
      maxRentalPrice: interior?.maxRentalPrice || 0,
      minPurchasePrice: interior?.minPurchasePrice || 0,
      maxPurchasePrice: interior?.maxPurchasePrice || 0
    });
    setInteriorModalOpen(true);
  };

  const closeInteriorModal = () => {
    setInteriorModalOpen(false);
    setSelectedInterior(null);
  };

  const handleInteriorSubmit = async () => {
    try {
      setError('');
      if (selectedInterior) {
        await updateInterior(selectedInterior.id, interiorForm);
      } else {
        await createInterior(interiorForm);
      }
      await loadData();
      closeInteriorModal();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleInteriorDelete = async (interiorId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet intérieur ?')) {
      try {
        await deleteInterior(interiorId);
        await loadData();
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Filter data
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInteriors = interiors.filter(interior =>
    interior.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interior.type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
        <BackgroundBeams className="absolute inset-0"/>
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-20 blur-sm"
      >
        <source src="/videos/vidbg.mp4" type="video/mp4"/>
      </video>

      <BackgroundBeams className="absolute inset-0"/>

      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Administration</h1>
        
        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ width: '100%' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
              '& .Mui-selected': { color: '#f4b53f !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#f4b53f' },
              mb: 3
            }}
          >
            <Tab icon={<People />} label="Utilisateurs" />
            <Tab icon={<Home />} label="Intérieurs" />
          </Tabs>

          {/* Search & Actions */}
          <div className="flex justify-between items-center mb-6">
            <TextField
              placeholder={tabValue === 0 ? "Rechercher un utilisateur..." : "Rechercher un intérieur..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
                style: { color: 'white' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                }
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => tabValue === 0 ? openUserModal() : openInteriorModal()}
              sx={{
                backgroundColor: '#f4b53f',
                '&:hover': { backgroundColor: '#e6a236' }
              }}
            >
              {tabValue === 0 ? 'Nouvel utilisateur' : 'Nouvel intérieur'}
            </Button>
          </div>

          {/* Users Tab */}
          <TabPanel value={tabValue} index={0}>
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{user.name || 'Sans nom'}</h3>
                        <Chip 
                          label={user.role} 
                          size="small"
                          sx={{
                            backgroundColor: user.role === 'ADMIN' ? '#ef444420' : '#3b82f620',
                            color: user.role === 'ADMIN' ? '#ef4444' : '#3b82f6',
                            border: `1px solid ${user.role === 'ADMIN' ? '#ef444430' : '#3b82f630'}`
                          }}
                        />
                      </div>
                      <p className="text-gray-300">{user.email}</p>
                      <p className="text-gray-500 text-sm">
                        Créé le {new Date(user.createdAt).toLocaleDateString()}
                        {user.lastLoginAt && ` • Dernière connexion: ${new Date(user.lastLoginAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <IconButton onClick={() => openUserModal(user)} sx={{ color: '#f4b53f' }}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleUserDelete(user.id)} sx={{ color: '#ef4444' }}>
                        <Delete />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>

          {/* Interiors Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="grid gap-4">
              {filteredInteriors.map((interior) => (
                <div key={interior.id} className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{interior.title}</h3>
                        <Chip 
                          label={interior.type.name} 
                          size="small"
                          sx={{
                            backgroundColor: '#f4b53f20',
                            color: '#f4b53f',
                            border: '1px solid #f4b53f30'
                          }}
                        />
                        {!interior.displayed && (
                          <Chip 
                            label="Masqué" 
                            size="small"
                            sx={{
                              backgroundColor: '#ef444420',
                              color: '#ef4444',
                              border: '1px solid #ef444430'
                            }}
                          />
                        )}
                      </div>
                      <p className="text-gray-300 mb-2">{interior.description || 'Aucune description'}</p>
                      <div className="text-sm text-gray-400 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {interior.rooms && <span>🏠 {interior.rooms} pièces</span>}
                        {interior.bedRooms && <span>🛏️ {interior.bedRooms} chambres</span>}
                        {interior.parkingSpots && <span>🚗 {interior.parkingSpots} parking(s)</span>}
                        {interior.floor !== null && <span>🏢 Étage {interior.floor}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <IconButton onClick={() => openInteriorModal(interior)} sx={{ color: '#f4b53f' }}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleInteriorDelete(interior.id)} sx={{ color: '#ef4444' }}>
                        <Delete />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>
        </Box>

        {/* User Modal */}
        <Dialog open={userModalOpen} onClose={closeUserModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#1a1a1a', color: 'white' }}>
            {selectedUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#1a1a1a' }}>
            <div className="space-y-4 pt-4">
              <TextField
                fullWidth
                label="Nom"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Rôle</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value as 'AGENT' | 'ADMIN'})}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f4b53f' }
                  }}
                >
                  <MenuItem value="AGENT">Agent</MenuItem>
                  <MenuItem value="ADMIN">Administrateur</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={selectedUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                type={showPassword ? 'text' : 'password'}
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#1a1a1a' }}>
            <Button onClick={closeUserModal} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <Cancel sx={{ mr: 1 }} /> Annuler
            </Button>
            <Button onClick={handleUserSubmit} sx={{ color: '#f4b53f' }}>
              <Save sx={{ mr: 1 }} /> Sauvegarder
            </Button>
          </DialogActions>
        </Dialog>

        {/* Interior Modal */}
        <Dialog open={interiorModalOpen} onClose={closeInteriorModal} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#1a1a1a', color: 'white' }}>
            {selectedInterior ? 'Modifier intérieur' : 'Nouvel intérieur'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#1a1a1a' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <TextField
                fullWidth
                label="Titre"
                value={interiorForm.title}
                onChange={(e) => setInteriorForm({...interiorForm, title: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Type</InputLabel>
                <Select
                  value={interiorForm.typeId}
                  onChange={(e) => setInteriorForm({...interiorForm, typeId: Number(e.target.value)})}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f4b53f' }
                  }}
                >
                  {typeInteriors.map((type) => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="URL des images"
                value={interiorForm.listImages}
                onChange={(e) => setInteriorForm({...interiorForm, listImages: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={interiorForm.description}
                onChange={(e) => setInteriorForm({...interiorForm, description: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              
              {/* Checkboxes */}
              <div className="col-span-full">
                <FormControlLabel
                  control={
                    <Switch 
                      checked={interiorForm.furniture}
                      onChange={(e) => setInteriorForm({...interiorForm, furniture: e.target.checked})}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#f4b53f' } }}
                    />
                  }
                  label="Meublé"
                  sx={{ color: 'white' }}
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={interiorForm.unfurnished}
                      onChange={(e) => setInteriorForm({...interiorForm, unfurnished: e.target.checked})}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#f4b53f' } }}
                    />
                  }
                  label="Non meublé"
                  sx={{ color: 'white', ml: 4 }}
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={interiorForm.displayed}
                      onChange={(e) => setInteriorForm({...interiorForm, displayed: e.target.checked})}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#f4b53f' } }}
                    />
                  }
                  label="Affiché"
                  sx={{ color: 'white', ml: 4 }}
                />
              </div>

              {/* Numbers */}
              <TextField
                fullWidth
                label="Pièces"
                type="number"
                value={interiorForm.rooms}
                onChange={(e) => setInteriorForm({...interiorForm, rooms: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Chambres"
                type="number"
                value={interiorForm.bedRooms}
                onChange={(e) => setInteriorForm({...interiorForm, bedRooms: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Étage"
                type="number"
                value={interiorForm.floor}
                onChange={(e) => setInteriorForm({...interiorForm, floor: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Places de parking"
                type="number"
                value={interiorForm.parkingSpots}
                onChange={(e) => setInteriorForm({...interiorForm, parkingSpots: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />

              {/* Prices */}
              <TextField
                fullWidth
                label="Prix location min"
                type="number"
                value={interiorForm.minRentalPrice}
                onChange={(e) => setInteriorForm({...interiorForm, minRentalPrice: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Prix location max"
                type="number"
                value={interiorForm.maxRentalPrice}
                onChange={(e) => setInteriorForm({...interiorForm, maxRentalPrice: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Prix achat min"
                type="number"
                value={interiorForm.minPurchasePrice}
                onChange={(e) => setInteriorForm({...interiorForm, minPurchasePrice: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Prix achat max"
                type="number"
                value={interiorForm.maxPurchasePrice}
                onChange={(e) => setInteriorForm({...interiorForm, maxPurchasePrice: Number(e.target.value)})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(244,181,63,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4b53f' }
                  }
                }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#1a1a1a' }}>
            <Button onClick={closeInteriorModal} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <Cancel sx={{ mr: 1 }} /> Annuler
            </Button>
            <Button onClick={handleInteriorSubmit} sx={{ color: '#f4b53f' }}>
              <Save sx={{ mr: 1 }} /> Sauvegarder
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
