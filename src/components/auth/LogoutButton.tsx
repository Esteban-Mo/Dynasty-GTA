"use client";

import { signOut } from "next-auth/react";
import { Logout } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({ className = "", showText = false }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
  };

  const tooltipStyles = {
    tooltip: {
      backgroundColor: '#1f1f1f',
      color: '#ffffff',
      fontSize: '14px',
      fontFamily: 'inherit',
      borderRadius: '8px',
      padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: '1px solid #f4b53f',
    },
    arrow: {
      color: '#1f1f1f',
      '&:before': {
        border: '1px solid #f4b53f',
      }
    }
  };

  if (showText) {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all duration-300 text-red-400 hover:text-red-300 ${className}`}
      >
        <Logout className="w-5 h-5" />
        <span>Déconnexion</span>
      </button>
    );
  }

  return (
    <Tooltip 
      title="Déconnexion" 
      placement="left" 
      arrow
      componentsProps={{
        tooltip: { sx: tooltipStyles.tooltip },
        arrow: { sx: tooltipStyles.arrow }
      }}
    >
      <IconButton
        onClick={handleLogout}
        sx={{
          color: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          '&:hover': { 
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            transform: 'scale(1.05)'
          },
          transition: 'all 0.3s ease'
        }}
        className={className}
      >
        <Logout fontSize="medium" />
      </IconButton>
    </Tooltip>
  );
}
