import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Home, Users, DollarSign, List, Download, Plus, Edit, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Item {
  id: string;
  sectionId: string;
  name: string;
  cost: number;
  deposit: number;
  paid: number;
  completed: boolean;
  notes: string;
  order: number;
}

interface Section {
  id: string;
  name: string;
  icon: string;
}

interface Guest {
  id: string;
  name: string;
  confirmed: boolean;
  amountDue: number;
  amountPaid: number;
  table: string;
  relation: string;
  notes: string;
}

const SECTIONS: Section[] = [
  { id: 'civil', name: 'Civil', icon: '📋' },
  { id: 'religious', name: 'Ceremonia Religiosa', icon: '⛪' },
  { id: 'venue', name: 'Salón / Recepción', icon: '🏛️' },
  { id: 'attire', name: 'Vestimenta', icon: '👗' },
  { id: 'vendors', name: 'Proveedorxs', icon: '🎵' },
  { id: 'souvenirs', name: 'Souvenirs / Cotillón', icon: '🎁' },
  { id: 'transport', name: 'Traslados / Hotel', icon: '🚗' },
  { id: 'tasks', name: 'Tareas Generales', icon: '✅' }
];

const COLORS = {
  primary: '#0D1B2A',
  secondary: '#A9D6E5',
  accent: '#A3B18A',
  light: '#FFFFFF'
};

export default function BernaValeWeddingApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'section' | 'guests' | 'budget'>('dashboard');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedItems = localStorage.getItem('wedding-items');
    const savedGuests = localStorage.getItem('wedding-guests');
    
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedGuests) setGuests(JSON.parse(savedGuests));
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('wedding-guests', JSON.stringify(guests));
  }, [guests]);

  const calculateBalance = (cost: number, deposit: number, paid: number): number => {
    return cost - deposit - paid;
  };

  const calculateSectionTotals = (sectionId: string) => {
    const sectionItems = items.filter(item => item.sectionId === sectionId);
    const totalCost = sectionItems.reduce((sum, item) => sum + item.cost, 0);
    const totalDeposit = sectionItems.reduce((sum, item) => sum + item.deposit, 0);
    const totalPaid = sectionItems.reduce((sum, item) => sum + item.paid, 0);
    const totalDue = totalCost - totalDeposit - totalPaid;
    const completed = sectionItems.filter(item => item.completed).length;
    const progress = sectionItems.length > 0 ? (completed / sectionItems.length) * 100 : 0;
    
    return { totalCost, totalDeposit, totalPaid, totalDue, progress };
  };

  const calculateOverallTotals = () => {
    const itemsCost = items.reduce((sum, item) => sum + item.cost, 0);
    const itemsDeposit = items.reduce((sum, item) => sum + item.deposit, 0);
    const itemsPaid = items.reduce((sum, item) => sum + item.paid, 0);
    const guestsDue = guests.reduce((sum, guest) => sum + guest.amountDue, 0);
    const guestsPaid = guests.reduce((sum, guest) => sum + guest.amountPaid, 0);
    
    const totalEstimated = itemsCost + guestsDue;
    const totalPaid = itemsDeposit + itemsPaid + guestsPaid;
    const totalPending = totalEstimated - totalPaid;
    const completedItems = items.filter(item => item.completed).length;
    const progress = items.length > 0 ? (completedItems / items.length) * 100 : 0;
    
    return { totalEstimated, totalPaid, totalPending, progress };
  };

  const handleSaveItem = (itemData: Partial<Item>) => {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...itemData } 
          : item
      ));
    } else {
      const newItem: Item = {
        id: Date.now().toString(),
        sectionId: selectedSection!,
        name: itemData.name || '',
        cost: itemData.cost || 0,
        deposit: itemData.deposit || 0,
        paid: itemData.paid || 0,
        completed: false,
        notes: itemData.notes || '',
        order: items.filter(i => i.sectionId === selectedSection).length
      };
      setItems([...items, newItem]);
    }
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleSaveGuest = (guestData: Partial<Guest>) => {
    if (editingGuest) {
      setGuests(guests.map(guest => 
        guest.id === editingGuest.id 
          ? { ...guest, ...guestData } 
          : guest
      ));
    } else {
      const newGuest: Guest = {
        id: Date.now().toString(),
        name: guestData.name || '',
        confirmed: guestData.confirmed || false,
        amountDue: guestData.amountDue || 0,
        amountPaid: guestData.amountPaid || 0,
        table: guestData.table || '',
        relation: guestData.relation || '',
        notes: guestData.notes || ''
      };
      setGuests([...guests, newGuest]);
    }
    setShowGuestForm(false);
    setEditingGuest(null);
  };

  const handleDeleteGuest = (id: string) => {
    setGuests(guests.filter(guest => guest.id !== id));
  };

  const handleExport = () => {
    const dataToExport = {
      items,
      guests,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'berna-vale-boda-backup.json';
    link.click();
  };

  const toggleItemExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderDashboard = () => {
    const totals = calculateOverallTotals();
    const chartData = [
      { name: 'Pagado', value: totals.totalPaid, color: COLORS.accent },
      { name: 'Pendiente', value: totals.totalPending, color: COLORS.secondary }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center py-6 px-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Berna & Vale</h1>
          <p className="text-lg md:text-xl text-blue-200">Nuestra Boda</p>
        </div>

        <Card className="bg-white border-2">
          <CardHeader>
            <CardTitle className="text-blue-900">Progreso General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Progreso: {totals.progress.toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground">{items.filter(i => i.completed).length} de {items.length} completados</span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${totals.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 min-h-20 flex flex-col justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Estimado</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-900">${totals.totalEstimated.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 min-h-20 flex flex-col justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Pagado</p>
                  <p className="text-xl md:text-2xl font-bold text-green-700">${totals.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200 min-h-20 flex flex-col justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Pendiente</p>
                  <p className="text-xl md:text-2xl font-bold text-orange-700">${totals.totalPending.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECTIONS.map(section => {
            const totals = calculateSectionTotals(section.id);
            return (
              <Card 
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300 active:scale-95"
                onClick={() => {
                  setSelectedSection(section.id);
                  setCurrentView('section');
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-900 text-base md:text-lg">
                    <span className="text-xl md:text-2xl">{section.icon}</span>
                    <span className="leading-tight">{section.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso:</span>
                      <span className="font-medium text-foreground">{totals.progress.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Costo Total:</span>
                      <span className="font-medium text-foreground">${totals.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pendiente:</span>
                      <span className="font-medium text-orange-600">${totals.totalDue.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300 active:scale-95"
            onClick={() => setCurrentView('guests')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-900 text-base md:text-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                <span>Invitados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium text-foreground">{guests.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confirmados:</span>
                  <span className="font-medium text-green-600">{guests.filter(g => g.confirmed).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recaudado:</span>
                  <span className="font-medium text-foreground">${guests.reduce((sum, g) => sum + g.amountPaid, 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300 active:scale-95"
            onClick={() => setCurrentView('budget')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-900 text-base md:text-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                <span>Presupuesto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Ver resumen completo de gastos y exportar datos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderSectionView = () => {
    const section = SECTIONS.find(s => s.id === selectedSection);
    if (!section) return null;

    const sectionItems = items.filter(item => item.sectionId === selectedSection);
    const totals = calculateSectionTotals(selectedSection!);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="border-2 min-h-10"
            size="sm"
          >
            Volver
          </Button>
          <h2 className="text-lg md:text-2xl font-bold text-blue-900 flex items-center gap-1 md:gap-2 flex-1 justify-center">
            <span className="text-2xl md:text-3xl">{section.icon}</span>
            <span className="leading-tight truncate">{section.name}</span>
          </h2>
          <Button 
            onClick={() => {
              setEditingItem(null);
              setShowItemForm(true);
            }}
            className="bg-blue-900 hover:bg-blue-800 min-h-10"
            size="sm"
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Agregar</span>
          </Button>
        </div>

        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Costo Total</p>
                <p className="text-base md:text-xl font-bold text-blue-900">${totals.totalCost.toLocaleString()}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Señas</p>
                <p className="text-base md:text-xl font-bold text-green-700">${totals.totalDeposit.toLocaleString()}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Pagado</p>
                <p className="text-base md:text-xl font-bold text-green-700">${totals.totalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Pendiente</p>
                <p className="text-base md:text-xl font-bold text-orange-700">${totals.totalDue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {sectionItems.map(item => {
            const balance = calculateBalance(item.cost, item.deposit, item.paid);
            const isExpanded = expandedItems.has(item.id);
            
            return (
              <Card key={item.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Button
                          variant={item.completed ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleComplete(item.id)}
                          className={`min-h-10 min-w-10 ${item.completed ? "bg-green-600 hover:bg-green-700" : ""}`}
                        >
                          {item.completed ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                        </Button>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-base md:text-lg ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs md:text-sm">
                            <div>
                              <span className="text-muted-foreground">Costo: </span>
                              <span className="font-medium text-foreground">${item.cost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Seña: </span>
                              <span className="font-medium text-green-700">${item.deposit.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pagado: </span>
                              <span className="font-medium text-green-700">${item.paid.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Saldo: </span>
                              <span className={`font-bold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                ${balance.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemExpanded(item.id)}
                          className="min-h-10 min-w-10"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setShowItemForm(true);
                          }}
                          className="min-h-10 min-w-10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="min-h-10 min-w-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {isExpanded && item.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showItemForm && (
          <ItemFormModal
            item={editingItem}
            onSave={handleSaveItem}
            onClose={() => {
              setShowItemForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </div>
    );
  };

  const renderGuestsView = () => {
    const totalGuests = guests.length;
    const confirmed = guests.filter(g => g.confirmed).length;
    const totalDue = guests.reduce((sum, g) => sum + g.amountDue, 0);
    const totalPaid = guests.reduce((sum, g) => sum + g.amountPaid, 0);
    const totalPending = totalDue - totalPaid;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="border-2 min-h-10"
            size="sm"
          >
            Volver
          </Button>
          <h2 className="text-lg md:text-2xl font-bold text-blue-900 flex items-center gap-1 md:gap-2 flex-1 justify-center">
            <Users className="w-6 h-6 md:w-8 md:h-8" />
            <span>Invitados</span>
          </h2>
          <Button 
            onClick={() => {
              setEditingGuest(null);
              setShowGuestForm(true);
            }}
            className="bg-blue-900 hover:bg-blue-800 min-h-10"
            size="sm"
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Agregar</span>
          </Button>
        </div>

        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Invitados</p>
                <p className="text-base md:text-xl font-bold text-blue-900">{totalGuests}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Confirmados</p>
                <p className="text-base md:text-xl font-bold text-green-700">{confirmed}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Recaudado</p>
                <p className="text-base md:text-xl font-bold text-green-700">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Pendiente</p>
                <p className="text-base md:text-xl font-bold text-orange-700">${totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {guests.map(guest => {
            const balance = guest.amountDue - guest.amountPaid;
            const isExpanded = expandedItems.has(guest.id);
            
            return (
              <Card key={guest.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-base md:text-lg text-foreground">{guest.name}</h3>
                          {guest.confirmed ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Confirmado
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                              Pendiente
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                          <div>
                            <span className="text-muted-foreground">Debe: </span>
                            <span className="font-medium text-foreground">${guest.amountDue.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pagó: </span>
                            <span className="font-medium text-green-700">${guest.amountPaid.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Saldo: </span>
                            <span className={`font-bold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              ${balance.toLocaleString()}
                            </span>
                          </div>
                          {guest.table && (
                            <div>
                              <span className="text-muted-foreground">Mesa: </span>
                              <span className="font-medium text-foreground">{guest.table}</span>
                            </div>
                          )}
                          {guest.relation && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Relación: </span>
                              <span className="font-medium text-foreground">{guest.relation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemExpanded(guest.id)}
                          className="min-h-10 min-w-10"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGuest(guest);
                            setShowGuestForm(true);
                          }}
                          className="min-h-10 min-w-10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="min-h-10 min-w-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {isExpanded && guest.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{guest.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showGuestForm && (
          <GuestFormModal
            guest={editingGuest}
            onSave={handleSaveGuest}
            onClose={() => {
              setShowGuestForm(false);
              setEditingGuest(null);
            }}
          />
        )}
      </div>
    );
  };

  const renderBudgetView = () => {
    const totals = calculateOverallTotals();
    
    const sectionData = SECTIONS.map(section => {
      const sectionTotals = calculateSectionTotals(section.id);
      return {
        name: section.name,
        Estimado: sectionTotals.totalCost,
        Pagado: sectionTotals.totalDeposit + sectionTotals.totalPaid,
        Pendiente: sectionTotals.totalDue
      };
    });

    const guestsTotals = {
      name: 'Invitados',
      Estimado: guests.reduce((sum, g) => sum + g.amountDue, 0),
      Pagado: guests.reduce((sum, g) => sum + g.amountPaid, 0),
      Pendiente: guests.reduce((sum, g) => sum + (g.amountDue - g.amountPaid), 0)
    };

    const chartData = [...sectionData, guestsTotals];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="border-2 min-h-10"
            size="sm"
          >
            Volver
          </Button>
          <h2 className="text-base md:text-2xl font-bold text-blue-900 flex items-center gap-1 md:gap-2 flex-1 justify-center">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8" />
            <span className="hidden md:inline">Presupuesto General</span>
            <span className="md:hidden">Presupuesto</span>
          </h2>
          <Button 
            onClick={handleExport}
            className="bg-green-700 hover:bg-green-800 min-h-10"
            size="sm"
          >
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
        </div>

        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground mb-2">Total Estimado</p>
                <p className="text-xl md:text-3xl font-bold text-blue-900">${totals.totalEstimated.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground mb-2">Total Pagado</p>
                <p className="text-xl md:text-3xl font-bold text-green-700">${totals.totalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground mb-2">Total Pendiente</p>
                <p className="text-xl md:text-3xl font-bold text-orange-700">${totals.totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-blue-900">Distribución por Sección</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: '#0D1B2A', fontSize: 10 }}
                />
                <YAxis tick={{ fill: '#0D1B2A' }} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Estimado" fill="#A9D6E5" />
                <Bar dataKey="Pagado" fill="#A3B18A" />
                <Bar dataKey="Pendiente" fill="#F4A261" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-blue-900">Detalle por Sección</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.map((section, index) => (
                <div key={index} className="p-3 md:p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-base md:text-lg text-foreground mb-2 md:mb-3">{section.name}</h3>
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-muted-foreground">Estimado</p>
                      <p className="font-medium text-foreground">${section.Estimado.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pagado</p>
                      <p className="font-medium text-green-700">${section.Pagado.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pendiente</p>
                      <p className="font-medium text-orange-700">${section.Pendiente.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pb-20">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'section' && renderSectionView()}
        {currentView === 'guests' && renderGuestsView()}
        {currentView === 'budget' && renderBudgetView()}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-lg z-50 safe-area-inset-bottom">
        <div className="container mx-auto px-2">
          <div className="flex justify-around py-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('dashboard')}
              className={`min-h-12 min-w-16 ${currentView === 'dashboard' ? 'bg-blue-900' : ''}`}
            >
              <Home className="w-6 h-6" />
            </Button>
            <Button
              variant={currentView === 'guests' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('guests')}
              className={`min-h-12 min-w-16 ${currentView === 'guests' ? 'bg-blue-900' : ''}`}
            >
              <Users className="w-6 h-6" />
            </Button>
            <Button
              variant={currentView === 'budget' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('budget')}
              className={`min-h-12 min-w-16 ${currentView === 'budget' ? 'bg-blue-900' : ''}`}
            >
              <DollarSign className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}

function ItemFormModal({ 
  item, 
  onSave, 
  onClose 
}: { 
  item: Item | null; 
  onSave: (data: Partial<Item>) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    cost: item?.cost || 0,
    deposit: item?.deposit || 0,
    paid: item?.paid || 0,
    notes: item?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-md border-2 my-4">
        <CardHeader>
          <CardTitle className="text-blue-900">
            {item ? 'Editar Item' : 'Nuevo Item'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground text-sm">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="cost" className="text-foreground text-sm">Costo Total</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                required
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="deposit" className="text-foreground text-sm">Seña</Label>
              <Input
                id="deposit"
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) || 0 })}
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="paid" className="text-foreground text-sm">Pagado</Label>
              <Input
                id="paid"
                type="number"
                value={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: parseFloat(e.target.value) || 0 })}
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-foreground text-sm">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="border-2 text-base"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800 min-h-12">
                Guardar
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-2 min-h-12">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function GuestFormModal({ 
  guest, 
  onSave, 
  onClose 
}: { 
  guest: Guest | null; 
  onSave: (data: Partial<Guest>) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: guest?.name || '',
    confirmed: guest?.confirmed || false,
    amountDue: guest?.amountDue || 0,
    amountPaid: guest?.amountPaid || 0,
    table: guest?.table || '',
    relation: guest?.relation || '',
    notes: guest?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-md border-2 my-4">
        <CardHeader>
          <CardTitle className="text-blue-900">
            {guest ? 'Editar Invitado' : 'Nuevo Invitado'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guest-name" className="text-foreground text-sm">Nombre</Label>
              <Input
                id="guest-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="confirmed"
                checked={formData.confirmed}
                onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="confirmed" className="text-foreground text-sm">Confirmó Asistencia</Label>
            </div>
            <div>
              <Label htmlFor="amount-due" className="text-foreground text-sm">Monto a Abonar</Label>
              <Input
                id="amount-due"
                type="number"
                value={formData.amountDue}
                onChange={(e) => setFormData({ ...formData, amountDue: parseFloat(e.target.value) || 0 })}
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="amount-paid" className="text-foreground text-sm">Monto Pagado</Label>
              <Input
                id="amount-paid"
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="table" className="text-foreground text-sm">Mesa</Label>
              <Input
                id="table"
                value={formData.table}
                onChange={(e) => setFormData({ ...formData, table: e.target.value })}
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="relation" className="text-foreground text-sm">Relación</Label>
              <Input
                id="relation"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                placeholder="Ej: Familia, Amigos, Trabajo"
                className="border-2 min-h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="guest-notes" className="text-foreground text-sm">Notas</Label>
              <Textarea
                id="guest-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="border-2 text-base"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800 min-h-12">
                Guardar
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-2 min-h-12">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
