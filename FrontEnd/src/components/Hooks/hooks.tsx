import React, { useState, useRef, useEffect } from 'react';

function useDropdown<T extends HTMLElement>() {
    const [isActive, setIsActive] = useState(false);
    const dropdownRef = useRef<T>(null);
    const dropdownRefIcon = useRef<T>(null);
  
    const toggleDropdown = (e: { stopPropagation: () => void }) => {
      e.stopPropagation(); // Evitar que el evento se propague al listener global
      setIsActive((prev) => !prev);
    };
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          dropdownRefIcon.current &&
          !dropdownRefIcon.current.contains(event.target as Node)
        ) {
          setIsActive(false); // Cierra el dropdown si se clickea fuera
        }
      };
  
      window.addEventListener('click', handleClickOutside);
      return () => {
        window.removeEventListener('click', handleClickOutside);
      };
    }, []);
  
    return { isActive, toggleDropdown, dropdownRef, dropdownRefIcon, setIsActive };
  }
export default useDropdown; 
