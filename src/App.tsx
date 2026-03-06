import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Plus, 
  Search, 
  Server, 
  Settings, 
  Trash2, 
  ExternalLink, 
  LayoutGrid,
  List as ListIcon,
  Tag,
  Clock,
  Edit3,
  X,
  Menu,
  User,
  Lock,
  ChevronDown,
  BarChart3,
  Activity,
  ShieldCheck,
  History,
  LogOut,
  FileText,
  UserCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Download,
  Upload,
  Moon,
  Sun,
  ChevronRight,
  Star,
  GripVertical,
  Copy,
  Check
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface Connection {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  group_name: string;
  notes: string;
  last_connected: string | null;
  favorite: number;
  sort_order: number;
}

interface ActivityLog {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  details?: string;
}

const mockChartData = [
  { name: 'Jan', connections: 400 },
  { name: 'Fev', connections: 300 },
  { name: 'Mar', connections: 600 },
  { name: 'Abr', connections: 800 },
  { name: 'Mai', connections: 500 },
  { name: 'Jun', connections: 900 },
  { name: 'Jul', connections: 700 },
];

const sparklineData = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 20 }, { value: 45 }, { value: 35 }
];

interface SortableItemProps {
  key?: any;
  conn: Connection;
  viewMode: 'grid' | 'list';
  appSettings: any;
  isSearching: boolean;
  toggleFavorite: (conn: Connection) => void;
  openEdit: (conn: Connection) => void;
  onDeleteClick: (id: number) => void;
  handleConnect: (conn: Connection) => void;
  connectingId: number | null;
  getAdaptiveFontSize: (text: string) => string;
  accent: any;
  copyToClipboard: (text: string, id: number) => void;
  copySuccess: number | null;
}

const SortableItem = ({ 
  conn, 
  viewMode, 
  appSettings, 
  isSearching, 
  toggleFavorite, 
  openEdit, 
  onDeleteClick, 
  handleConnect, 
  connectingId, 
  getAdaptiveFontSize,
  accent,
  copyToClipboard,
  copySuccess
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: conn.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  if (viewMode === 'grid') {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className={`group border rounded-xl hover:shadow-lg transition-all ${appSettings.darkMode ? `bg-gray-900 border-gray-800 ${accent.dark.border}` : `bg-white border-gray-200 ${accent.border.replace('border-', 'hover:border-')}`} ${appSettings.density === 'Compacta' ? 'p-3' : 'p-5'}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg flex items-center justify-center transition-colors ${appSettings.darkMode ? `${accent.dark.light} ${accent.dark.text}` : `${accent.light} ${accent.text}`} ${appSettings.density === 'Compacta' ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <Server size={appSettings.density === 'Compacta' ? 16 : 20} />
            </div>
            {!isSearching && (
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                <GripVertical size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => toggleFavorite(conn)}
              className={`p-1.5 rounded transition-colors ${conn.favorite === 1 ? 'text-amber-500' : (appSettings.darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500')}`}
              title={conn.favorite === 1 ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star size={14} className={conn.favorite === 1 ? 'fill-amber-500' : ''} />
            </button>
            <button 
              onClick={() => openEdit(conn)}
              className={`p-1.5 rounded transition-colors ${appSettings.darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Editar"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={() => onDeleteClick(conn.id)}
              className={`p-1.5 rounded transition-colors ${appSettings.darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <h3 
          className={`font-bold mb-1 line-clamp-2 leading-snug ${appSettings.darkMode ? 'text-white' : 'text-gray-900'} ${appSettings.density === 'Compacta' ? 'text-xs h-8' : `h-9 ${getAdaptiveFontSize(conn.name)}`}`} 
          title={conn.name}
        >
          {conn.name}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${appSettings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            {conn.group_name}
          </span>
        </div>

        <button 
          onClick={() => handleConnect(conn)}
          disabled={connectingId === conn.id}
          className={`w-full rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${connectingId === conn.id ? 'bg-emerald-500 text-white cursor-default' : `${accent.bg} text-white ${accent.hover} shadow-sm`} ${appSettings.density === 'Compacta' ? 'py-1.5 text-[10px]' : 'py-2.5 text-xs'}`}
        >
          {connectingId === conn.id ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Iniciando...
            </>
          ) : (
            <>
              Conectar Agora
              <ChevronRight size={appSettings.density === 'Compacta' ? 12 : 14} />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <tr 
      ref={setNodeRef}
      style={style}
      className={`transition-colors group ${appSettings.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {!isSearching && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
              <GripVertical size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <button 
            onClick={() => toggleFavorite(conn)}
            className={`transition-colors ${conn.favorite === 1 ? 'text-amber-500' : (appSettings.darkMode ? 'text-gray-700 hover:text-gray-500' : 'text-gray-200 hover:text-gray-400')}`}
          >
            <Star size={14} className={conn.favorite === 1 ? 'fill-amber-500' : ''} />
          </button>
          <Server size={16} className={accent.text} />
          <span className={`text-sm font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{conn.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">
            {appSettings.maskData ? '•••.•••.•••.•••' : `${conn.host}:${conn.port}`}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); copyToClipboard(conn.host, conn.id); }}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${copySuccess === conn.id ? 'text-green-500' : 'text-gray-400'}`}
            title="Copiar IP"
          >
            {copySuccess === conn.id ? <Check size={10} /> : <Copy size={10} />}
          </button>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${appSettings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
          {conn.group_name}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => handleConnect(conn)}
            disabled={connectingId === conn.id}
            className={`p-2 rounded-lg transition-colors ${connectingId === conn.id ? 'text-emerald-500' : (appSettings.darkMode ? `${accent.dark.text} ${accent.dark.light}` : `${accent.text} ${accent.light}`)}`}
            title="Conectar"
          >
            {connectingId === conn.id ? <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /> : <ExternalLink size={16} />}
          </button>
          <button 
            onClick={() => openEdit(conn)}
            className={`p-2 rounded-lg transition-colors ${appSettings.darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="Configurações"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={() => onDeleteClick(conn.id)}
            className={`p-2 rounded-lg transition-colors ${appSettings.darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface SortableStatProps {
  children: React.ReactNode;
  id: string;
  key?: any;
}

const SortableStat = ({ children, id }: SortableStatProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-black/5 rounded">
        <GripVertical size={12} className="text-gray-400" />
      </div>
      {children}
    </div>
  );
};

interface SortableWidgetProps {
  children: React.ReactNode;
  className?: string;
  id: string;
  key?: any;
}

const SortableWidget = ({ children, className, id }: SortableWidgetProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };
  return (
    <div ref={setNodeRef} style={style} className={`${className} relative group`}>
      <div {...attributes} {...listeners} className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1.5 bg-black/5 rounded-lg">
        <GripVertical size={14} className="text-gray-400" />
      </div>
      {children}
    </div>
  );
};

export default function App() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [activeTab, setActiveTab] = useState('Painel');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [connectingId, setConnectingId] = useState<number | null>(null);
  const [chartFilter, setChartFilter] = useState<'year' | 'month' | 'week'>('year');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('rdp_central_settings');
    const defaultSettings = {
      darkMode: false,
      density: 'Confortável',
      language: 'Português (BR)',
      defaultPort: 3389,
      defaultUser: '',
      resolution: 'Tela Cheia',
      maskData: false,
      masterUsername: 'admin',
      masterPassword: '',
      serverStatus: 'Saudável',
      dashboardStatsOrder: ['total', 'today', 'activity', 'groups'],
      dashboardWidgetsOrder: ['chart', 'recent', 'favorites', 'groupUsage'],
      accentColor: 'blue',
      autoLockTimeout: 0,
      confirmDelete: true,
      connectionMethod: 'ms-rd', // 'download', 'ms-rd', 'direct'
      performanceProfile: 'Equilibrado',
      userName: 'Michel Bruno',
      userRole: 'ADMINISTRADOR',
      loginLogoUrl: ''
    };
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved);
    return { ...defaultSettings, ...parsed };
  });

  // Auto-Lock Logic
  useEffect(() => {
    if (!isUnlocked || appSettings.autoLockTimeout <= 0) return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsUnlocked(false);
        setActivities(prev => [{
          id: Date.now(),
          type: 'reset',
          description: 'Sistema bloqueado automaticamente por inatividade',
          timestamp: new Date().toISOString()
        }, ...prev]);
      }, appSettings.autoLockTimeout * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [isUnlocked, appSettings.autoLockTimeout]);

  useEffect(() => {
    localStorage.setItem('rdp_central_settings', JSON.stringify(appSettings));
    if (appSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings]);

  useEffect(() => {
    if (!appSettings.masterPassword) {
      setIsUnlocked(true);
    }
  }, [appSettings.masterPassword]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter menos de 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppSettings(prev => ({ ...prev, loginLogoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      username: appSettings.defaultUser,
      group_name: 'Geral',
      notes: '',
      favorite: false
    });
  };

  const getAdaptiveFontSize = (text: string) => {
    const len = text.length;
    if (len < 25) return 'text-sm';
    if (len < 45) return 'text-[13px]';
    if (len < 60) return 'text-[11px]';
    return 'text-[10px]';
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    username: '',
    group_name: 'Geral',
    notes: '',
    favorite: false
  });

  useEffect(() => {
    fetchConnections();
    fetchActivities();
  }, []);

  const [copySuccess, setCopySuccess] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      console.error('Failed to fetch connections', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities', err);
    }
  };

  const logActivity = async (type: string, description: string, details?: string) => {
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, details })
      });
      fetchActivities();
    } catch (err) {
      console.error('Failed to log activity', err);
    }
  };

  const downloadRegFile = () => {
    const regContent = `Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\\rdp]
@="URL:Remote Desktop Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\\rdp\\shell]
[HKEY_CLASSES_ROOT\\rdp\\shell\\open]
[HKEY_CLASSES_ROOT\\rdp\\shell\\open\\command]
@="powershell.exe -WindowStyle Hidden -Command \\"$url = '%1'; $address = ($url -replace 'rdp://', '').TrimEnd('/'); mstsc.exe /v:$address\\""
`;
    const blob = new Blob([regContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ativar_rdp_direto.reg';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form...', formData);
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const url = editingConnection ? `/api/connections/${editingConnection.id}` : '/api/connections';
      const method = editingConnection ? 'PUT' : 'POST';
      
      // Parse address into host and port
      let host = formData.address;
      let port = appSettings.defaultPort || 3389;

      if (formData.address.includes(':')) {
        const parts = formData.address.split(':');
        host = parts[0];
        port = parseInt(parts[1]) || port;
      }
      
      const payload = {
        name: formData.name,
        host,
        port,
        username: formData.username,
        group_name: formData.group_name,
        notes: formData.notes,
        favorite: formData.favorite ? 1 : 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingConnection(null);
        resetForm();
        await fetchConnections();
        logActivity(
          editingConnection ? 'edit' : 'create', 
          `${editingConnection ? 'Editou' : 'Criou'} a conexão: ${formData.name}`,
          `Endereço: ${host}:${port}`
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Save failed', errorData);
      }
    } catch (err) {
      console.error('Failed to save connection', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    console.log('Deleting connection...', id);
    const connToDelete = connections.find(c => c.id === id);
    try {
      const res = await fetch(`/api/connections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchConnections();
        setShowDeleteConfirm(null);
        if (connToDelete) {
          logActivity('delete', `Excluiu a conexão: ${connToDelete.name}`, `IP: ${connToDelete.host}`);
        }
      }
    } catch (err) {
      console.error('Failed to delete connection', err);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(connections, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `rdp_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    logActivity('export', 'Exportou backup das conexões', `${connections.length} conexões exportadas`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          for (const conn of imported) {
            await fetch('/api/connections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: conn.name,
                host: conn.host,
                port: conn.port,
                username: conn.username,
                group_name: conn.group_name,
                notes: conn.notes
              })
            });
          }
          await fetchConnections();
          logActivity('import', 'Importou backup de conexões', `${imported.length} conexões processadas`);
          alert('Importação concluída com sucesso!');
        }
      } catch (err) {
        console.error('Import failed', err);
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (!confirm('ATENÇÃO: Isso apagará TODAS as suas conexões e CONFIGURAÇÕES permanentemente. Deseja continuar?')) return;
    try {
      const res = await fetch('/api/connections/reset', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('rdp_central_settings');
        setAppSettings({
          darkMode: false,
          density: 'Confortável',
          language: 'Português (BR)',
          defaultPort: 3389,
          defaultUser: '',
          resolution: 'Tela Cheia',
          maskData: false,
          masterPassword: '',
          serverStatus: 'Saudável',
          version: '1.2.0'
        });
        await fetchConnections();
        alert('Todos os dados e configurações foram apagados.');
      }
    } catch (err) {
      console.error('Reset failed', err);
    }
  };

  const toggleFavorite = async (conn: Connection) => {
    try {
      const newFavorite = conn.favorite === 1 ? 0 : 1;
      const res = await fetch(`/api/connections/${conn.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: newFavorite })
      });
      if (res.ok) {
        fetchConnections();
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = connections.findIndex((c) => c.id === active.id);
      const newIndex = connections.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(connections, oldIndex, newIndex) as Connection[];
      handleReorder(newOrder);
    }
  };

  const handleDashboardStatsReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = appSettings.dashboardStatsOrder.indexOf(active.id as string);
      const newIndex = appSettings.dashboardStatsOrder.indexOf(over.id as string);
      const newOrder = arrayMove(appSettings.dashboardStatsOrder, oldIndex, newIndex);
      const newSettings = { ...appSettings, dashboardStatsOrder: newOrder };
      setAppSettings(newSettings);
      localStorage.setItem('rdp_central_settings', JSON.stringify(newSettings));
    }
  };

  const handleDashboardWidgetsReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = appSettings.dashboardWidgetsOrder.indexOf(active.id as string);
      const newIndex = appSettings.dashboardWidgetsOrder.indexOf(over.id as string);
      const newOrder = arrayMove(appSettings.dashboardWidgetsOrder, oldIndex, newIndex);
      const newSettings = { ...appSettings, dashboardWidgetsOrder: newOrder };
      setAppSettings(newSettings);
      localStorage.setItem('rdp_central_settings', JSON.stringify(newSettings));
    }
  };

  const handleReorder = async (newOrder: Connection[]) => {
    setConnections(newOrder);
    try {
      const orders = newOrder.map((conn, idx) => ({ id: conn.id, sort_order: idx }));
      await fetch('/api/connections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });
    } catch (err) {
      console.error('Failed to save new order', err);
    }
  };

  const getAccentClasses = () => {
    const color = appSettings.accentColor || 'blue';
    const map: Record<string, any> = {
      blue: {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        light: 'bg-blue-50',
        border: 'border-blue-200',
        ring: 'focus:ring-blue-500/20',
        dark: {
          light: 'bg-blue-900/20',
          text: 'text-blue-400',
          border: 'hover:border-blue-900'
        }
      },
      emerald: {
        bg: 'bg-emerald-600',
        hover: 'hover:bg-emerald-700',
        text: 'text-emerald-600',
        light: 'bg-emerald-50',
        border: 'border-emerald-200',
        ring: 'focus:ring-emerald-500/20',
        dark: {
          light: 'bg-emerald-900/20',
          text: 'text-emerald-400',
          border: 'hover:border-emerald-900'
        }
      },
      violet: {
        bg: 'bg-violet-600',
        hover: 'hover:bg-violet-700',
        text: 'text-violet-600',
        light: 'bg-violet-50',
        border: 'border-violet-200',
        ring: 'focus:ring-violet-500/20',
        dark: {
          light: 'bg-violet-900/20',
          text: 'text-violet-400',
          border: 'hover:border-violet-900'
        }
      },
      amber: {
        bg: 'bg-amber-600',
        hover: 'hover:bg-amber-700',
        text: 'text-amber-600',
        light: 'bg-amber-50',
        border: 'border-amber-200',
        ring: 'focus:ring-amber-500/20',
        dark: {
          light: 'bg-amber-900/20',
          text: 'text-amber-400',
          border: 'hover:border-amber-900'
        }
      },
      rose: {
        bg: 'bg-rose-600',
        hover: 'hover:bg-rose-700',
        text: 'text-rose-600',
        light: 'bg-rose-50',
        border: 'border-rose-200',
        ring: 'focus:ring-rose-500/20',
        dark: {
          light: 'bg-rose-900/20',
          text: 'text-rose-400',
          border: 'hover:border-rose-900'
        }
      }
    };
    return map[color] || map.blue;
  };

  const accent = getAccentClasses();

  const handleConnect = async (conn: Connection) => {
    setConnectingId(conn.id);
    console.log('Connecting to...', conn.host);
    
    // Garantir que o endereço tenha o formato IP:PORTA
    const fullAddress = conn.host.includes(':') ? conn.host : `${conn.host}:${conn.port}`;
    
    // Conteúdo do arquivo .rdp otimizado para Windows (MSTSC)
    // Usando \r\n (CRLF) que é o padrão exigido pelo Windows
    const rdpContent = [
      'screen mode id:i:2',
      'use multimon:i:0',
      `full address:s:${fullAddress}`,
      `username:s:${conn.username || ''}`,
      'compression:i:1',
      'keyboardhook:i:2',
      'audiomode:i:0',
      'redirectdrives:i:0',
      'redirectprinters:i:1',
      'redirectcomports:i:0',
      'redirectsmartcards:i:1',
      'displayconnectionbar:i:1',
      'autoreconnection enabled:i:1',
      'authentication level:i:2',
      'negotiate security layer:i:1',
      'enablecredsspsupport:i:1',
      'prompt for credentials:i:1',
      appSettings.resolution !== 'Tela Cheia' && appSettings.resolution.includes('x') 
        ? `desktopwidth:i:${appSettings.resolution.split('x')[0]}\r\ndesktopheight:i:${appSettings.resolution.split('x')[1]}` 
        : '',
    ].filter(line => line !== '').join('\r\n');

    try {
      // 1. Primeiro atualizamos o banco de dados e registramos a atividade
      await Promise.all([
        fetch(`/api/connections/${conn.id}/connect`, { method: 'POST' }),
        fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'connection', 
            description: `Iniciou conexão com: ${conn.name}`, 
            details: `IP: ${fullAddress} (Método: ${appSettings.connectionMethod})` 
          })
        })
      ]).catch(err => console.warn('Aviso: Falha ao registrar log:', err));

      fetchConnections();
      fetchActivities();

      // 2. Agora disparar o RDP conforme o método escolhido
      if (appSettings.connectionMethod === 'direct') {
        // MODO DIRETO (mstsc.exe): Usa o protocolo rdp:// (Requer o arquivo .reg aplicado)
        // Removemos qualquer barra final que o navegador possa tentar adicionar
        const protocolUrl = `rdp://${fullAddress}`.replace(/\/$/, '');
        const link = document.createElement('a');
        link.href = protocolUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (appSettings.connectionMethod === 'ms-rd') {
        // MODO APP MODERNO: Usa o protocolo ms-rd:
        const msRdUrl = `ms-rd:connect?fulladdress=s:${fullAddress}${conn.username ? `&username=s:${conn.username}` : ''}`;
        window.location.href = msRdUrl;
      } else {
        // MODO COMPATIBILIDADE: Download de arquivo .rdp
        const blob = new Blob([rdpContent], { type: 'application/x-rdp;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeName = conn.name.replace(/[^a-z0-9]/gi, '_');
        link.download = `${safeName}.rdp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to connect', err);
    } finally {
      setTimeout(() => setConnectingId(null), 2000);
    }
  };

  const openEdit = (conn: Connection) => {
    setEditingConnection(conn);
    setFormData({
      name: conn.name,
      address: `${conn.host}${conn.port !== 3389 ? `:${conn.port}` : ''}`,
      username: conn.username,
      group_name: conn.group_name,
      notes: conn.notes,
      favorite: conn.favorite === 1
    });
    setIsModalOpen(true);
  };

  const translations: Record<string, any> = {
    'Português (BR)': {
      dashboard: 'Painel',
      connections: 'Conexões',
      activity: 'Atividade',
      groups: 'Grupos',
      settings: 'Configurações',
      logout: 'Sair',
      menu: 'Menu',
      search: 'Pesquisar conexões...',
      totalConnections: 'Total de Conexões',
      connectionsToday: 'Conexões Hoje',
      activities24h: 'Atividades (24h)',
      totalGroups: 'Total de Grupos',
      recentActivities: 'Atividades Recentes',
      favorites: 'Favoritos',
      groupUsage: 'Uso por Grupo',
      systemStatus: 'Sobre o Sistema',
      status: 'Estado',
      healthy: 'Saudável',
      version: 'Versão',
      database: 'Banco de Dados',
      environment: 'Ambiente',
      production: 'Produção',
      profile: 'Perfil do Usuário',
      interface: 'Preferências de Interface',
      darkMode: 'Modo Escuro',
      listDensity: 'Densidade da Lista',
      language: 'Idioma',
      accentColor: 'Cor de Destaque',
      connectionDefaults: 'Padrões de Conexão',
      security: 'Segurança e Privacidade',
      dataManagement: 'Gerenciamento de Dados',
      export: 'Exportar JSON',
      import: 'Importar JSON',
      factoryReset: 'Reset de Fábrica',
      displayName: 'NOME DE EXIBIÇÃO',
      role: 'CARGO / FUNÇÃO',
      save: 'Salvar Alterações',
      cancel: 'Cancelar',
      add: 'Adicionar',
      edit: 'Editar',
      delete: 'Excluir',
      connect: 'Conectar',
      host: 'Endereço / Host',
      port: 'Porta',
      username: 'Usuário',
      group: 'Grupo',
      notes: 'Notas / Observações',
      favorite: 'Favorito',
      markFavorite: 'Marcar como Favorito',
      connectNow: 'Conectar Agora',
      saving: 'Salvando...',
      confirmDelete: 'Confirmar Exclusão',
      autoLock: 'Bloqueio Automático',
      performance: 'Perfil de Performance',
      balanced: 'Equilibrado',
      highQuality: 'Alta Qualidade',
      lowBandwidth: 'Baixa Banda',
      never: 'Nunca',
      minutes: 'minutos',
    },
    'English (US)': {
      dashboard: 'Dashboard',
      connections: 'Connections',
      activity: 'Activity',
      groups: 'Groups',
      settings: 'Settings',
      logout: 'Logout',
      menu: 'Menu',
      search: 'Search connections...',
      totalConnections: 'Total Connections',
      connectionsToday: 'Connections Today',
      activities24h: 'Activities (24h)',
      totalGroups: 'Total Groups',
      recentActivities: 'Recent Activities',
      favorites: 'Favorites',
      groupUsage: 'Group Usage',
      systemStatus: 'System Status',
      status: 'Status',
      healthy: 'Healthy',
      version: 'Version',
      database: 'Database',
      environment: 'Environment',
      production: 'Production',
      profile: 'User Profile',
      interface: 'Interface Preferences',
      darkMode: 'Dark Mode',
      listDensity: 'List Density',
      language: 'Language',
      accentColor: 'Accent Color',
      connectionDefaults: 'Connection Defaults',
      security: 'Security & Privacy',
      dataManagement: 'Data Management',
      export: 'Export JSON',
      import: 'Import JSON',
      factoryReset: 'Factory Reset',
      displayName: 'DISPLAY NAME',
      role: 'ROLE / FUNCTION',
      save: 'Save Changes',
      cancel: 'Cancel',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      connect: 'Connect',
      host: 'Address / Host',
      port: 'Port',
      username: 'Username',
      group: 'Group',
      notes: 'Notes / Observations',
      favorite: 'Favorite',
      markFavorite: 'Mark as Favorite',
      connectNow: 'Connect Now',
      saving: 'Saving...',
      confirmDelete: 'Confirm Delete',
      autoLock: 'Auto Lock',
      performance: 'Performance Profile',
      balanced: 'Balanced',
      highQuality: 'High Quality',
      lowBandwidth: 'Low Bandwidth',
      never: 'Never',
      minutes: 'minutes',
    },
    'Español': {
      dashboard: 'Panel',
      connections: 'Conexiones',
      activity: 'Actividad',
      groups: 'Grupos',
      settings: 'Configuración',
      logout: 'Salir',
      menu: 'Menú',
      search: 'Buscar conexiones...',
      totalConnections: 'Total de Conexiones',
      connectionsToday: 'Conexiones Hoy',
      activities24h: 'Actividades (24h)',
      totalGroups: 'Total de Grupos',
      recentActivities: 'Actividades Recientes',
      favorites: 'Favoritos',
      groupUsage: 'Uso por Grupo',
      systemStatus: 'Sobre el Sistema',
      status: 'Estado',
      healthy: 'Saludable',
      version: 'Versión',
      database: 'Base de Datos',
      environment: 'Ambiente',
      production: 'Producción',
      profile: 'Perfil de Usuario',
      interface: 'Preferencias de Interfaz',
      darkMode: 'Modo Oscuro',
      listDensity: 'Densidad de Lista',
      language: 'Idioma',
      accentColor: 'Color de Acento',
      connectionDefaults: 'Valores Predeterminados',
      security: 'Seguridad y Privacidad',
      dataManagement: 'Gestión de Datos',
      export: 'Exportar JSON',
      import: 'Importar JSON',
      factoryReset: 'Restablecimiento de Fábrica',
      displayName: 'NOMBRE DE MOSTRAR',
      role: 'CARGO / FUNCIÓN',
      save: 'Guardar Cambios',
      cancel: 'Cancelar',
      add: 'Añadir',
      edit: 'Editar',
      delete: 'Eliminar',
      connect: 'Conectar',
      host: 'Dirección / Host',
      port: 'Puerto',
      username: 'Usuario',
      group: 'Grupo',
      notes: 'Notas / Observaciones',
      favorite: 'Favorito',
      markFavorite: 'Marcar como Favorito',
      connectNow: 'Conectar Ahora',
      saving: 'Guardando...',
      confirmDelete: 'Confirmar Eliminación',
      autoLock: 'Bloqueo Automático',
      performance: 'Perfil de Rendimiento',
      balanced: 'Equilibrado',
      highQuality: 'Alta Calidad',
      lowBandwidth: 'Bajo Ancho de Banda',
      never: 'Nunca',
      minutes: 'minutos',
    }
  };

  const t = (key: string) => {
    return translations[appSettings.language]?.[key] || translations['Português (BR)'][key] || key;
  };

  const navItems = [
    { name: t('dashboard'), icon: LayoutGrid, id: 'Painel' },
    { name: t('connections'), icon: Server, id: 'Conexões' },
    { name: t('activity'), icon: History, id: 'Atividade' },
    { name: t('groups'), icon: Tag, id: 'Grupos' },
    { name: t('settings'), icon: Settings, id: 'Configurações' },
  ];

  const connectionsToday = activities.filter(a => 
    a.type === 'connection' && 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const totalGroups = new Set(connections.map(c => c.group_name)).size;

  const activitiesLast24h = activities.filter(a => {
    const activityDate = new Date(a.timestamp);
    const now = new Date();
    return (now.getTime() - activityDate.getTime()) < (24 * 60 * 60 * 1000);
  }).length;

  const groupUsageData = Array.from(new Set(connections.map(c => c.group_name))).map(group => {
    const groupConns = connections.filter(c => c.group_name === group).map(c => c.name);
    const count = activities.filter(a => a.type === 'connection' && groupConns.includes(a.description.replace('Iniciou conexão com: ', ''))).length;
    return { name: group, value: count };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  const realChartData = (() => {
    const currentYear = new Date().getFullYear();
    const now = new Date();

    if (chartFilter === 'year') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const data = months.map(month => ({ name: month, connections: 0 }));
      activities.forEach(activity => {
        if (activity.type === 'connection') {
          const date = new Date(activity.timestamp);
          if (date.getFullYear() === currentYear) {
            data[date.getMonth()].connections += 1;
          }
        }
      });
      return data.slice(0, now.getMonth() + 1);
    } else if (chartFilter === 'month') {
      // Last 30 days
      const data: { name: string, connections: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        data.push({ name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), connections: 0 });
      }
      activities.forEach(activity => {
        if (activity.type === 'connection') {
          const date = new Date(activity.timestamp);
          const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
          if (diffDays >= 0 && diffDays < 30) {
            data[29 - diffDays].connections += 1;
          }
        }
      });
      return data;
    } else {
      // Last 7 days
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const data: { name: string, connections: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        data.push({ name: days[d.getDay()], connections: 0 });
      }
      activities.forEach(activity => {
        if (activity.type === 'connection') {
          const date = new Date(activity.timestamp);
          const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            data[6 - diffDays].connections += 1;
          }
        }
      });
      return data;
    }
  })();

  const onDeleteClick = (id: number) => {
    if (appSettings.confirmDelete) {
      setShowDeleteConfirm(id);
    } else {
      handleDelete(id);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${appSettings.darkMode ? 'bg-gray-950 text-gray-100' : 'bg-[#F0F2F5] text-gray-900'}`}>
      {!isUnlocked && appSettings.masterPassword ? (
        <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl"
          >
            <div className="mb-6">
              <h1 className="text-blue-500 font-black text-xl tracking-tighter">S.O.S INFORMÁTICA E IMPRESSORAS</h1>
              <p className="text-blue-400/60 text-[10px] uppercase tracking-[0.3em] font-bold">Serviços Gerenciados</p>
            </div>
            <div className="flex justify-center mb-6">
              {appSettings.loginLogoUrl ? (
                <img 
                  src={appSettings.loginLogoUrl} 
                  alt="Logo" 
                  className="h-28 w-auto object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-16 h-16 ${accent.dark.light} ${accent.dark.text} rounded-2xl flex items-center justify-center mx-auto`}>
                  <Shield size={32} />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
            <p className="text-gray-400 text-sm mb-8">Identifique-se para acessar o painel de Serviços Gerenciados.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (usernameInput === appSettings.masterUsername && passwordInput === appSettings.masterPassword) {
                setIsUnlocked(true);
              } else {
                alert('Usuário ou senha incorretos!');
                setPasswordInput('');
              }
            }} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text"
                    autoFocus
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Usuário"
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-${appSettings.accentColor}-500 transition-colors pl-11`}
                  />
                  <User size={18} className="absolute left-4 top-3.5 text-gray-500" />
                </div>
                <div className="relative">
                  <input 
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Senha"
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-${appSettings.accentColor}-500 transition-colors pl-11`}
                  />
                  <Lock size={18} className="absolute left-4 top-3.5 text-gray-500" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => alert('Para recuperar sua senha, entre em contato com o suporte técnico da S.O.S Informática.')}
                  className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors font-semibold uppercase tracking-wider"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button 
                type="submit"
                className={`w-full ${accent.bg} ${accent.hover} text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2`}
              >
                Entrar no Sistema
              </button>
            </form>
          </motion.div>
        </div>
      ) : null}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className={`flex flex-col z-30 transition-colors duration-300 ${appSettings.darkMode ? 'bg-gray-900 border-r border-gray-800' : 'bg-[#001529] text-white'}`}
      >
        <div className={`h-16 flex items-center border-b transition-all duration-300 ${sidebarOpen ? 'px-6' : 'px-0 justify-center'} ${appSettings.darkMode ? 'border-gray-800' : 'border-white/10'}`}>
          <div className={`flex items-center gap-3 overflow-hidden`}>
            {appSettings.loginLogoUrl ? (
              <div className={`${sidebarOpen ? 'w-10 h-10' : 'w-12 h-12'} rounded flex items-center justify-center shrink-0 overflow-hidden transition-all duration-300`}>
                <img 
                  src={appSettings.loginLogoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center shrink-0">
                <Monitor size={20} />
              </div>
            )}
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-black text-[10px] tracking-tighter text-white leading-none">S.O.S INFORMÁTICA</span>
                <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-0.5">Serviços Gerenciados</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full flex items-center px-6 py-3 gap-4 text-gray-400 hover:text-white transition-colors mb-2 ${!sidebarOpen ? 'justify-center' : ''}`}
            title={sidebarOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            <Menu size={20} />
            {sidebarOpen && <span className="text-sm font-medium">{t('menu')}</span>}
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 gap-4 transition-colors relative ${
                activeTab === item.id ? `${accent.bg} text-white` : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              {activeTab === item.id && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-full bg-white" />
              )}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${appSettings.darkMode ? 'border-gray-800' : 'border-white/10'}`}>
          <button 
            onClick={() => {
              setIsUnlocked(false);
              setUsernameInput('');
              setPasswordInput('');
            }}
            className="w-full flex items-center px-2 py-2 gap-4 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">{t('logout')}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-16 border-b flex items-center justify-between px-6 shrink-0 transition-colors duration-300 ${appSettings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
            </div>
          </div>

          <div className="flex flex-1 justify-center px-4">
            <span className={`text-base sm:text-lg font-bold tracking-tight text-center line-clamp-1 ${appSettings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              Gerenciador de Acessos Remotos
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setAppSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              className={`p-2 rounded-lg transition-colors ${appSettings.darkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              {appSettings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`h-8 w-px mx-2 ${appSettings.darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-3 cursor-pointer p-1 rounded-lg transition-colors ${appSettings.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-semibold leading-none ${appSettings.darkMode ? 'text-white' : 'text-gray-900'}`}>{appSettings.userName}</p>
                <p className={`text-[10px] mt-1 uppercase font-bold tracking-wider ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{appSettings.userRole}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${appSettings.darkMode ? 'bg-gray-950' : 'bg-[#F0F2F5]'}`}>
          <div className="max-w-[1600px] mx-auto space-y-6">
            {activeTab === 'Painel' ? (
              <div className="space-y-6 pb-20">
                {/* Stats Grid */}
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDashboardStatsReorder}
                  modifiers={[restrictToWindowEdges]}
                >
                  <SortableContext items={appSettings.dashboardStatsOrder} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {appSettings.dashboardStatsOrder.map((id: string) => {
                        if (id === 'total') return (
                          <SortableStat key={id} id={id}>
                            <StatCard 
                              title={t('totalConnections')} 
                              value={connections.length.toString()} 
                              trend="Total" 
                              color="blue"
                              data={sparklineData}
                              darkMode={appSettings.darkMode}
                              accentColor={appSettings.accentColor}
                            />
                          </SortableStat>
                        );
                        if (id === 'today') return (
                          <SortableStat key={id} id={id}>
                            <StatCard 
                              title={t('connectionsToday')} 
                              value={connectionsToday.toString()} 
                              trend="Hoje" 
                              color="green"
                              data={sparklineData.map(d => ({ value: d.value * 0.8 }))}
                              darkMode={appSettings.darkMode}
                              accentColor={appSettings.accentColor}
                            />
                          </SortableStat>
                        );
                        if (id === 'activity') return (
                          <SortableStat key={id} id={id}>
                            <StatCard 
                              title={t('activities24h')} 
                              value={activitiesLast24h.toString()} 
                              trend="24h" 
                              color="red"
                              data={sparklineData.map(d => ({ value: d.value * 0.5 }))}
                              darkMode={appSettings.darkMode}
                              accentColor={appSettings.accentColor}
                            />
                          </SortableStat>
                        );
                        if (id === 'groups') return (
                          <SortableStat key={id} id={id}>
                            <StatCard 
                              title={t('totalGroups')} 
                              value={totalGroups.toString()} 
                              trend="Grupos" 
                              color="orange"
                              darkMode={appSettings.darkMode}
                              accentColor={appSettings.accentColor}
                            />
                          </SortableStat>
                        );
                        return null;
                      })}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Main Content Grid */}
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDashboardWidgetsReorder}
                  modifiers={[restrictToWindowEdges]}
                >
                  <SortableContext items={appSettings.dashboardWidgetsOrder} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {appSettings.dashboardWidgetsOrder.map((id: string) => {
                        if (id === 'chart') return (
                          <SortableWidget key={id} id={id} className="lg:col-span-2">
                            <div className={`rounded-lg border p-6 shadow-sm transition-all duration-300 h-full hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                              <div className="flex items-center justify-between mb-6">
                                <h3 className={`font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Frequência de Conexões</h3>
                                <div className={`flex p-1 rounded-md text-xs font-medium ${appSettings.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                  <button onClick={() => setChartFilter('year')} className={`px-3 py-1 rounded shadow-sm transition-all ${chartFilter === 'year' ? (appSettings.darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600') : (appSettings.darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800')}`}>Ano todo</button>
                                  <button onClick={() => setChartFilter('month')} className={`px-3 py-1 rounded shadow-sm transition-all ${chartFilter === 'month' ? (appSettings.darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600') : (appSettings.darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800')}`}>Mês todo</button>
                                  <button onClick={() => setChartFilter('week')} className={`px-3 py-1 rounded shadow-sm transition-all ${chartFilter === 'week' ? (appSettings.darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600') : (appSettings.darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800')}`}>Semana toda</button>
                                </div>
                              </div>
                              <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={realChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={appSettings.darkMode ? '#1f2937' : '#f0f0f0'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <Tooltip cursor={{ fill: appSettings.darkMode ? '#111827' : '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: appSettings.darkMode ? '#1f2937' : '#ffffff', color: appSettings.darkMode ? '#ffffff' : '#000000' }} />
                                    <Bar dataKey="connections" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </SortableWidget>
                        );

                        if (id === 'recent') return (
                          <SortableWidget key={id} id={id}>
                            <div className={`rounded-lg border shadow-sm flex flex-col h-full transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                              <div className={`p-6 border-b flex items-center justify-between ${appSettings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <h3 className={`font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Conexões Recentes</h3>
                                <button onClick={() => { setEditingConnection(null); resetForm(); setIsModalOpen(true); }} className="text-blue-600 text-xs font-bold hover:underline">+ Adicionar</button>
                              </div>
                              <div className="flex-1 overflow-y-auto max-h-[400px]">
                                {connections.length > 0 ? (
                                  <div className={`divide-y ${appSettings.darkMode ? 'divide-gray-800' : 'divide-gray-50'}`}>
                                    {[...connections].sort((a, b) => (b.last_connected ? new Date(b.last_connected).getTime() : 0) - (a.last_connected ? new Date(a.last_connected).getTime() : 0)).slice(0, 10).map((conn, idx) => (
                                      <div key={conn.id} className={`p-4 flex items-start gap-4 transition-colors group ${appSettings.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${appSettings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`font-semibold line-clamp-2 leading-tight ${appSettings.darkMode ? 'text-white' : 'text-gray-900'} ${getAdaptiveFontSize(conn.name)}`}>{conn.name}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            {conn.last_connected && <span className="text-[10px] text-gray-400">{new Date(conn.last_connected).toLocaleDateString('pt-BR')}</span>}
                                          </div>
                                        </div>
                                        <button onClick={() => handleConnect(conn)} className={`p-2 rounded-lg transition-all ${appSettings.darkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'}`}><ExternalLink size={16} /></button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400"><Server size={32} className="mb-2 opacity-20" /><p className="text-sm">Nenhuma conexão ainda</p></div>
                                )}
                              </div>
                              <div className={`p-4 border-t text-center ${appSettings.darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                <button onClick={() => setActiveTab('Atividade')} className="text-xs text-gray-500 hover:text-gray-800 font-medium">Ver toda a atividade</button>
                              </div>
                            </div>
                          </SortableWidget>
                        );

                        if (id === 'favorites') return (
                          <SortableWidget key={id} id={id}>
                            <div className={`rounded-lg border shadow-sm overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                              <div className={`p-5 border-b flex items-center justify-between ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                                <div className="flex items-center gap-2"><Star size={18} className="text-amber-500 fill-amber-500" /><h3 className={`font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Favoritos</h3></div>
                              </div>
                              <div className={`divide-y ${appSettings.darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                {connections.filter(c => c.favorite === 1).slice(0, 5).map(conn => (
                                  <div key={conn.id} className="p-4 flex items-center justify-between group">
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-bold truncate ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{conn.name}</p>
                                    </div>
                                    <button onClick={() => handleConnect(conn)} className={`p-2 rounded-lg transition-all ${appSettings.darkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'}`}><ExternalLink size={14} /></button>
                                  </div>
                                ))}
                                {connections.filter(c => c.favorite === 1).length === 0 && <div className="p-8 text-center text-gray-400 text-xs">Nenhum favorito ainda</div>}
                              </div>
                            </div>
                          </SortableWidget>
                        );

                        if (id === 'groupUsage') return (
                          <SortableWidget key={id} id={id} className="lg:col-span-2">
                            <div className={`rounded-lg border shadow-sm overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                              <div className={`p-5 border-b flex items-center justify-between ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                                <h3 className={`font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Uso por Grupo (Top 5)</h3>
                                <button onClick={() => setActiveTab('Grupos')} className="text-blue-600 text-xs font-bold hover:underline">Ver tudo</button>
                              </div>
                              <div className="p-6 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={groupUsageData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={appSettings.darkMode ? '#1f2937' : '#f0f0f0'} />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} width={100} />
                                    <Tooltip cursor={{ fill: appSettings.darkMode ? '#111827' : '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: appSettings.darkMode ? '#1f2937' : '#ffffff', color: appSettings.darkMode ? '#ffffff' : '#000000', fontSize: '10px' }} />
                                    <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </SortableWidget>
                        );
                        return null;
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ) : activeTab === 'Conexões' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Minhas Conexões</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex p-1 rounded-lg shadow-sm border transition-colors ${appSettings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? (appSettings.darkMode ? `${accent.dark.light} ${accent.dark.text}` : `${accent.light} ${accent.text}`) : (appSettings.darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}`}
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? (appSettings.darkMode ? `${accent.dark.light} ${accent.dark.text}` : `${accent.light} ${accent.text}`) : (appSettings.darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}`}
                      >
                        <ListIcon size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => { setEditingConnection(null); resetForm(); setIsModalOpen(true); }}
                      className={`flex items-center gap-2 ${accent.bg} text-white px-4 py-2 rounded-lg text-sm font-semibold ${accent.hover} transition-colors shadow-sm`}
                    >
                      <Plus size={18} />
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder={t('search')} 
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-colors ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <select 
                    className={`px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-colors ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                    onChange={(e) => setSearch(e.target.value === 'All' ? '' : e.target.value)}
                  >
                    <option value="All">Todos os Grupos</option>
                    {Array.from(new Set(connections.map(c => c.group_name))).map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Connections Content */}
                {(() => {
                  const filteredConnections = connections.filter(c => 
                    c.name.toLowerCase().includes(search.toLowerCase()) || 
                    c.host.toLowerCase().includes(search.toLowerCase()) ||
                    c.group_name.toLowerCase().includes(search.toLowerCase())
                  );
                  
                  const isSearching = search.trim().length > 0;

                  return (
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToWindowEdges]}
                    >
                      {viewMode === 'grid' ? (
                        <div className={`grid gap-6 ${appSettings.density === 'Compacta' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                          <SortableContext items={filteredConnections.map(c => c.id)} strategy={rectSortingStrategy}>
                            <AnimatePresence mode="popLayout">
                              {filteredConnections.map((conn) => (
                                <SortableItem 
                                  key={conn.id} 
                                  conn={conn} 
                                  viewMode={viewMode}
                                  appSettings={appSettings}
                                  isSearching={isSearching}
                                  toggleFavorite={toggleFavorite}
                                  openEdit={openEdit}
                                  onDeleteClick={onDeleteClick}
                                  handleConnect={handleConnect}
                                  connectingId={connectingId}
                                  getAdaptiveFontSize={getAdaptiveFontSize}
                                  accent={accent}
                                  copyToClipboard={copyToClipboard}
                                  copySuccess={copySuccess}
                                />
                              ))}
                            </AnimatePresence>
                          </SortableContext>
                        </div>
                      ) : (
                        <div className={`rounded-xl overflow-hidden shadow-sm border ${appSettings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className={`border-b ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Servidor</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grupo</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                              </tr>
                            </thead>
                            <SortableContext items={filteredConnections.map(c => c.id)} strategy={verticalListSortingStrategy}>
                              <tbody className={`divide-y ${appSettings.darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                {filteredConnections.map((conn) => (
                                  <SortableItem 
                                    key={conn.id} 
                                    conn={conn} 
                                    viewMode={viewMode}
                                    appSettings={appSettings}
                                    isSearching={isSearching}
                                    toggleFavorite={toggleFavorite}
                                    openEdit={openEdit}
                                    onDeleteClick={onDeleteClick}
                                    handleConnect={handleConnect}
                                    connectingId={connectingId}
                                    getAdaptiveFontSize={getAdaptiveFontSize}
                                    accent={accent}
                                    copyToClipboard={copyToClipboard}
                                    copySuccess={copySuccess}
                                  />
                                ))}
                              </tbody>
                            </SortableContext>
                          </table>
                        </div>
                      )}
                      <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                          styles: {
                            active: {
                              opacity: '0.5',
                            },
                          },
                        }),
                      }}>
                        {activeId ? (
                          (() => {
                            const conn = connections.find(c => c.id === activeId);
                            if (!conn) return null;
                            if (viewMode === 'grid') {
                              return (
                                <div className={`group border rounded-xl shadow-2xl transition-all ${appSettings.darkMode ? 'bg-gray-900 border-blue-900' : 'bg-white border-blue-200'} ${appSettings.density === 'Compacta' ? 'p-3' : 'p-5'}`}>
                                  <div className="flex justify-between items-start mb-3">
                                    <div className={`rounded-lg flex items-center justify-center transition-colors ${appSettings.darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'} ${appSettings.density === 'Compacta' ? 'w-8 h-8' : 'w-10 h-10'}`}>
                                      <Server size={appSettings.density === 'Compacta' ? 16 : 20} />
                                    </div>
                                  </div>
                                  <h3 className={`font-bold mb-1 line-clamp-2 leading-snug ${appSettings.darkMode ? 'text-white' : 'text-gray-900'} ${appSettings.density === 'Compacta' ? 'text-xs h-8' : `h-9 ${getAdaptiveFontSize(conn.name)}`}`}>
                                    {conn.name}
                                  </h3>
                                </div>
                              );
                            }
                            return (
                              <div className={`p-4 flex items-center gap-3 border rounded-lg shadow-2xl ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
                                <Server size={16} className="text-blue-500" />
                                <span className="text-sm font-semibold">{conn.name}</span>
                              </div>
                            );
                          })()
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  );
                })()}

                {connections.length === 0 && (
                  <div className="bg-white border border-dashed border-gray-300 rounded-xl p-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <Server size={32} />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Nenhuma conexão encontrada</h3>
                    <p className={`text-sm mb-6 ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Comece adicionando seu primeiro servidor RDP.</p>
                    <button 
                      onClick={() => { setIsModalOpen(true); resetForm(); }}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={18} />
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'Atividade' ? (
              <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className={`text-2xl font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Histórico de Atividades</h1>
                    <p className={`text-sm ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acompanhe todas as ações realizadas no sistema.</p>
                  </div>
                  <button 
                    onClick={fetchActivities}
                    className={`p-2 rounded-lg transition-colors ${appSettings.darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    title="Atualizar"
                  >
                    <History size={20} />
                  </button>
                </div>

                <div className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                  {activities.length > 0 ? (
                    <div className={`divide-y ${appSettings.darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                      {activities.map((activity) => (
                        <div key={activity.id} className={`p-4 flex items-start gap-4 transition-colors ${appSettings.darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50/50'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            activity.type === 'connection' ? (appSettings.darkMode ? 'bg-blue-900/20' : 'bg-blue-50') :
                            activity.type === 'create' ? (appSettings.darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50') :
                            activity.type === 'delete' ? (appSettings.darkMode ? 'bg-red-900/20' : 'bg-red-50') :
                            (appSettings.darkMode ? 'bg-gray-800' : 'bg-gray-100')
                          }`}>
                            {activity.type === 'connection' ? <ExternalLink size={18} className="text-blue-500" /> :
                             activity.type === 'create' ? <Plus size={18} className="text-emerald-500" /> :
                             activity.type === 'edit' ? <Edit3 size={18} className="text-amber-500" /> :
                             activity.type === 'delete' ? <Trash2 size={18} className="text-red-500" /> :
                             activity.type === 'reset' ? <AlertCircle size={18} className="text-red-600" /> :
                             activity.type === 'import' ? <Upload size={18} className="text-blue-600" /> :
                             activity.type === 'export' ? <Download size={18} className="text-emerald-600" /> :
                             <Clock size={18} className="text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`text-sm font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {activity.description}
                              </p>
                              <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                                {new Date(activity.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            {activity.details && (
                              <p className="text-xs text-gray-500 font-mono truncate">
                                {activity.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <History size={32} />
                      </div>
                      <h3 className={`text-lg font-bold mb-1 ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Nenhuma atividade registrada</h3>
                      <p className={`text-sm ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>As ações realizadas no sistema aparecerão aqui.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'Configurações' ? (
              <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="mb-8">
                  <h1 className={`text-2xl font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Configurações</h1>
                  <p className={`${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gerencie as preferências do sistema e padrões de conexão.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card: Perfil do Usuário */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className={`p-5 border-b flex items-center gap-3 ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${appSettings.darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <User size={18} />
                      </div>
                      <h3 className={`font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t('profile')}</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('displayName')}</label>
                        <input 
                          type="text" 
                          value={appSettings.userName}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, userName: e.target.value }))}
                          className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('role')}</label>
                        <input 
                          type="text" 
                          value={appSettings.userRole}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, userRole: e.target.value }))}
                          className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} 
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Card: Preferências de Interface */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className={`p-5 border-b flex items-center gap-3 ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${appSettings.darkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <LayoutGrid size={18} />
                      </div>
                      <h3 className={`font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t('interface')}</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('darkMode')}</p>
                          <p className={`text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Alternar entre tema claro e escuro</p>
                        </div>
                        <button 
                          onClick={() => setAppSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                          className={`w-12 h-6 rounded-full relative transition-colors ${appSettings.darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${appSettings.darkMode ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('listDensity')}</p>
                          <p className={`text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Opção para visualização compacta</p>
                        </div>
                        <select 
                          value={appSettings.density}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, density: e.target.value }))}
                          className={`text-xs border rounded px-2 py-1 outline-none ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        >
                          <option>Confortável</option>
                          <option>Compacta</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('language')}</p>
                          <p className={`text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Definir idioma da interface</p>
                        </div>
                        <select 
                          value={appSettings.language}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, language: e.target.value }))}
                          className={`text-xs border rounded px-2 py-1 outline-none ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        >
                          <option>Português (BR)</option>
                          <option>English (US)</option>
                          <option>Español</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('accentColor')}</p>
                          <p className={`text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cor principal do sistema</p>
                        </div>
                        <div className="flex gap-1.5">
                          {['blue', 'emerald', 'violet', 'amber', 'rose'].map(color => (
                            <button
                              key={color}
                              onClick={() => setAppSettings(prev => ({ ...prev, accentColor: color }))}
                              className={`w-5 h-5 rounded-full border-2 transition-all ${
                                color === 'blue' ? 'bg-blue-500' : 
                                color === 'emerald' ? 'bg-emerald-500' : 
                                color === 'violet' ? 'bg-violet-500' : 
                                color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                              } ${appSettings.accentColor === color ? 'border-white ring-2 ring-gray-300' : 'border-transparent'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card: Padrões de Conexão */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className={`p-5 border-b flex items-center gap-3 ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${appSettings.darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Server size={18} />
                      </div>
                      <h3 className={`font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Padrões de Conexão</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Porta RDP Padrão</label>
                          <input 
                            type="number" 
                            value={appSettings.defaultPort}
                            onChange={(e) => setAppSettings(prev => ({ ...prev, defaultPort: parseInt(e.target.value) }))}
                            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resolução Padrão</label>
                          <select 
                            value={appSettings.resolution}
                            onChange={(e) => setAppSettings(prev => ({ ...prev, resolution: e.target.value }))}
                            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                          >
                            <option>Tela Cheia</option>
                            <option>1920x1080</option>
                            <option>1024x768</option>
                            <option>800x600</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usuário Sugerido</label>
                        <input 
                          type="text" 
                          value={appSettings.defaultUser}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, defaultUser: e.target.value }))}
                          placeholder="Ex: Administrador" 
                          className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Método de Conexão</label>
                        <select 
                          value={appSettings.connectionMethod}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, connectionMethod: e.target.value as any }))}
                          className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        >
                          <option value="direct">⚡ Conexão Direta (mstsc.exe)</option>
                          <option value="ms-rd">🚀 App Moderno (Sem Downloads)</option>
                          <option value="download">📂 Modo Compatibilidade (Download)</option>
                        </select>
                        <div className={`mt-2 p-3 rounded-lg text-[10px] leading-relaxed border ${appSettings.darkMode ? 'bg-blue-900/10 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                          {appSettings.connectionMethod === 'direct' && (
                            <div className="space-y-2">
                              <p className="font-bold">Para funcionar sem baixar arquivos:</p>
                              <p>1. Clique no botão abaixo para baixar o ativador.</p>
                              <p>2. Execute o arquivo <b>ativar_rdp_direto.reg</b> e aceite as mensagens do Windows.</p>
                              <button 
                                onClick={downloadRegFile}
                                className="mt-1 px-3 py-1.5 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <Download size={12} /> Baixar Ativador (.reg)
                              </button>
                            </div>
                          )}
                          {appSettings.connectionMethod === 'ms-rd' && (
                            <div className="space-y-1">
                              <p className="font-bold">Como funciona:</p>
                              <p>• Abre o app 'Área de Trabalho Remota' da Microsoft Store.</p>
                            </div>
                          )}
                          {appSettings.connectionMethod === 'download' && (
                            <div className="space-y-1">
                              <p className="font-bold">Dica:</p>
                              <p>• Clique com o botão direito no arquivo baixado e marque "Sempre abrir arquivos deste tipo".</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Perfil de Performance</label>
                        <select 
                          value={appSettings.performanceProfile}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, performanceProfile: e.target.value }))}
                          className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        >
                          <option>Baixa Banda</option>
                          <option>Equilibrado</option>
                          <option>Alta Qualidade</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card: Segurança e Privacidade */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className={`p-5 border-b flex items-center gap-3 ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${appSettings.darkMode ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                        <Shield size={18} />
                      </div>
                      <h3 className={`font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Segurança e Privacidade</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Mascarar Dados Sensíveis</p>
                          <p className={`text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ocultar IPs e usuários na tela principal</p>
                        </div>
                        <button 
                          onClick={() => setAppSettings(prev => ({ ...prev, maskData: !prev.maskData }))}
                          className={`p-2 rounded-lg transition-colors ${appSettings.maskData ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {appSettings.maskData ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Confirmar Exclusão</p>
                          <p className={`text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exibir aviso antes de excluir</p>
                        </div>
                        <button 
                          onClick={() => setAppSettings(prev => ({ ...prev, confirmDelete: !prev.confirmDelete }))}
                          className={`w-12 h-6 rounded-full relative transition-colors ${appSettings.confirmDelete ? 'bg-emerald-600' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${appSettings.confirmDelete ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Bloqueio Automático</p>
                          <p className={`text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bloquear após inatividade (minutos)</p>
                        </div>
                        <select 
                          value={appSettings.autoLockTimeout}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, autoLockTimeout: parseInt(e.target.value) }))}
                          className={`text-xs border rounded px-2 py-1 outline-none ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                        >
                          <option value={0}>Desativado</option>
                          <option value={5}>5 min</option>
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={60}>1 hora</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usuário Mestre</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={appSettings.masterUsername}
                              onChange={(e) => setAppSettings(prev => ({ ...prev, masterUsername: e.target.value }))}
                              placeholder="Usuário de acesso" 
                              className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} 
                            />
                            <User size={16} className="absolute right-3 top-2.5 text-gray-300" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Senha Mestra</label>
                          <div className="relative">
                            <input 
                              type="password" 
                              value={appSettings.masterPassword}
                              onChange={(e) => setAppSettings(prev => ({ ...prev, masterPassword: e.target.value }))}
                              placeholder="Senha de acesso" 
                              className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-amber-500 ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} 
                            />
                            <ShieldCheck size={16} className="absolute right-3 top-2.5 text-gray-300" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Logo do Sistema (Login)</label>
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${appSettings.darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                            {appSettings.loginLogoUrl ? (
                              <img src={appSettings.loginLogoUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                            ) : (
                              <Shield size={24} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${appSettings.darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                                <Upload size={14} />
                                Escolher Arquivo
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                              </label>
                              {appSettings.loginLogoUrl && (
                                <button 
                                  onClick={() => setAppSettings(prev => ({ ...prev, loginLogoUrl: '' }))}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${appSettings.darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                >
                                  <Trash2 size={14} />
                                  Remover
                                </button>
                              )}
                            </div>
                            <p className={`text-[10px] ${appSettings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recomendado: PNG ou JPG transparente, máx 2MB.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card: Gerenciamento de Dados */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className={`p-5 border-b flex items-center gap-3 ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${appSettings.darkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        <History size={18} />
                      </div>
                        <h3 className={`font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t('dataManagement')}</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={handleExport}
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors group ${appSettings.darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                          <Download size={20} className="text-gray-400 group-hover:text-emerald-600" />
                          <span className={`text-xs font-bold ${appSettings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Exportar JSON</span>
                        </button>
                        <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-colors group text-center ${appSettings.darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <Upload size={20} className="text-gray-400 group-hover:text-blue-600" />
                          <span className={`text-xs font-bold ${appSettings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Importar JSON</span>
                          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                      </div>
                      <button 
                        onClick={handleResetData}
                        className="w-full px-4 py-3 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                      >
                        <Trash2 size={16} />
                        Reset de Fábrica
                      </button>
                    </div>
                  </motion.div>

                  {/* Card: Sobre o Sistema */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`rounded-xl border shadow-sm overflow-hidden col-span-1 md:col-span-2 transition-all duration-300 hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className={`p-5 border-b flex items-center justify-between ${appSettings.darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50/50 border-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${appSettings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                          <Activity size={18} />
                        </div>
                        <h3 className={`font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t('systemStatus')}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase ${appSettings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('status')}:</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          {appSettings.serverStatus}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                          <Monitor size={32} />
                        </div>
                        <div>
                          <h4 className={`font-black text-xl tracking-tight ${appSettings.darkMode ? 'text-white' : 'text-gray-900'}`}>CENTRAL DE RDPs</h4>
                          <p className="text-sm text-gray-500">Gerenciador de Acessos Remotos</p>
                        </div>
                      </div>
                      <div className="flex gap-8">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('version')}</p>
                          <p className={`text-sm font-bold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-800'}`}>v1.2.0</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('database')}</p>
                          <p className={`text-sm font-bold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-800'}`}>SQLite 3</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('environment')}</p>
                          <p className={`text-sm font-bold ${appSettings.darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Produção</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : activeTab === 'Grupos' ? (
              <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="mb-8">
                  <h1 className={`text-2xl font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Grupos de Servidores</h1>
                  <p className={`text-sm ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Organização das suas conexões por categorias.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from(new Set(connections.map(c => c.group_name))).map((group, idx) => {
                    const groupConns = connections.filter(c => c.group_name === group);
                    return (
                      <motion.div 
                        key={group}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-6 rounded-xl border shadow-sm transition-all hover:shadow-lg ${appSettings.darkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-900' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${appSettings.darkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Tag size={24} />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${appSettings.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            {groupConns.length} {groupConns.length === 1 ? 'Conexão' : 'Conexões'}
                          </span>
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{group}</h3>
                        <div className="space-y-2 mt-4">
                          {groupConns.slice(0, 3).map(c => (
                            <div key={c.id} className={`flex items-center gap-2 text-xs ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span className="truncate">{c.name}</span>
                            </div>
                          ))}
                          {groupConns.length > 3 && (
                            <p className="text-[10px] text-gray-400 font-medium">+ {groupConns.length - 3} outros servidores</p>
                          )}
                        </div>
                        <button 
                          onClick={() => { setActiveTab('Conexões'); setSearch(group); }}
                          className={`w-full mt-6 py-2.5 rounded-lg text-xs font-bold transition-all border ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}
                        >
                          Ver Conexões
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
                <LayoutGrid size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Guia "{activeTab}" em desenvolvimento</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal - Reusing existing logic but styling to match new theme */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transition-colors duration-300 ${appSettings.darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}
            >
              <div className={`px-6 py-4 border-b flex items-center justify-between ${appSettings.darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <h2 className={`text-lg font-bold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{editingConnection ? 'Editar Servidor' : 'Adicionar Novo Servidor'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full text-gray-400 transition-colors ${appSettings.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={`block text-xs font-bold uppercase mb-1 ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nome de Exibição</label>
                    <input 
                      required
                      type="text" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-xs font-bold uppercase mb-1 ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Endereço (Host:Porta)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: 191.6.5.108:3389"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usuário</label>
                    <input 
                      type="text" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Grupo</label>
                    <input 
                      type="text" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors ${appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      value={formData.group_name}
                      onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-3 py-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, favorite: !formData.favorite})}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${
                        formData.favorite 
                          ? (appSettings.darkMode ? 'bg-amber-900/20 border-amber-500/50 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-600')
                          : (appSettings.darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-400')
                      }`}
                    >
                      <Star size={14} className={formData.favorite ? 'fill-amber-500' : ''} />
                      {formData.favorite ? 'Favorito' : 'Marcar como Favorito'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  {editingConnection && (
                    <button 
                      type="button"
                      onClick={() => handleConnect(editingConnection)}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Conectar Agora
                    </button>
                  )}
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={`flex-1 px-4 py-2 border rounded-md font-semibold transition-colors text-sm ${appSettings.darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        editingConnection ? 'Salvar Alterações' : 'Adicionar'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-sm rounded-xl shadow-2xl p-6 text-center transition-colors duration-300 ${appSettings.darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${appSettings.darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
                <Trash2 size={24} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Excluir Conexão</h3>
              <p className={`text-sm mb-6 ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tem certeza que deseja excluir esta conexão? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`flex-1 px-4 py-2 border rounded-md font-semibold transition-colors text-sm ${appSettings.darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors text-sm"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, trend, color, data, isPercent, darkMode, accentColor }: { 
  title: string, 
  value: string, 
  trend: string, 
  color: 'blue' | 'green' | 'red' | 'orange',
  data?: any[],
  isPercent?: boolean,
  darkMode?: boolean,
  accentColor?: string
}) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className={`rounded-lg border p-6 shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg ${darkMode ? `bg-gray-900 border-gray-800 hover:border-${accentColor}-900` : `bg-white border-gray-200 hover:border-${accentColor}-200`}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h4 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</h4>
        </div>
        {isPercent ? (
          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-[10px] font-bold ${darkMode ? 'border-orange-900/20 border-t-orange-500 text-orange-400' : 'border-orange-100 border-t-orange-500 text-orange-600'}`}>
            {value}
          </div>
        ) : null}
      </div>
    </div>
  );
}
