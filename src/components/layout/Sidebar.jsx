import { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  ChevronRight, 
  ChevronDown,
  Menu,
  X,
  FolderOpen
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Auto-expand based on route if needed
  const [expandedItems, setExpandedItems] = useState(['configuration', 'doc-categories', 'charts']);

  const toggleExpand = (id) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={cn(
        "bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col fixed lg:relative z-40",
        isOpen ? "w-64" : "w-20",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <LayoutDashboard size={20} />
          </div>
          {isOpen && <span className="ml-3 font-bold text-xl text-gray-800 tracking-tight">Aurora</span>}
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto text-gray-400 hover:text-gray-600 hidden lg:block"
          >
            {isOpen ? <ChevronDown className="rotate-90" size={16} /> : <ChevronDown className="-rotate-90" size={16} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Home" 
            to="/"
            isOpen={isOpen} 
            active={location.pathname === '/' || location.pathname === '/home'}
          />

          <div className="pt-4 pb-2">
            {isOpen && <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Modules</p>}
            
            <NavItem 
              icon={<Settings size={20} />} 
              label="Configuration" 
              isOpen={isOpen} 
              hasSubmenu
              expanded={expandedItems.includes('configuration')}
              onToggle={() => toggleExpand('configuration')}
            >
               <div className="space-y-1 mt-1">
                  <NavItem 
                     icon={<FolderOpen size={18} />} 
                     label="Category" 
                     to="/configuration/category"
                     isOpen={isOpen} 
                     isSubitem
                     active={isActive('/configuration/category')}
                  />
               </div>
            </NavItem>
          </div>
        </div>
      </nav>

      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

function NavItem({ 
  icon, label, to, isOpen, active, hasSubmenu, expanded, onToggle, isSubitem, level = 0, children 
}) {
  const content = (
    <div 
      className={cn(
        "flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors group relative",
        active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        !isOpen && "justify-center",
        isSubitem && !active && "text-gray-500"
      )}
      onClick={hasSubmenu ? onToggle : undefined}
      style={{ paddingLeft: isOpen ? `${(level * 12) + 12}px` : '' }}
    >
      {icon && <span className={cn("shrink-0", active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")}>{icon}</span>}
      
      {isOpen && (
        <>
          <span className={cn("ml-3 truncate flex-1", !icon && "pl-0")}>{label}</span>
          {hasSubmenu && (
            <ChevronRight 
              size={14} 
              className={cn(
                "text-gray-400 transition-transform duration-200", 
                expanded && "rotate-90"
              )} 
            />
          )}
        </>
      )}

      {!isOpen && !isSubitem && (
         <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label}
         </div>
      )}
    </div>
  );

  return (
    <div>
      {to && !hasSubmenu ? (
        <Link to={to} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
      {isOpen && expanded && children && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
