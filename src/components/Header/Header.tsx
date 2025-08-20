import React, { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  onLogout: () => void;
  user: { email: string } | null;
  onTaskClick?: () => void;
  onCalendarClick?: () => void;
  currentPage?: 'calendar' | 'task';
}

const Header: React.FC<HeaderProps> = ({ 
  onLogout, 
  user, 
  onTaskClick, 
  onCalendarClick,
  currentPage = 'calendar'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const handleLogoutClick = () => {
    console.log('🚪 로그아웃 버튼 클릭됨');
    setIsDropdownOpen(false);
    onLogout();
  };

  const toggleDropdown = () => {
    console.log('🔄 드롭다운 토글:', !isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 디버깅을 위한 콘솔 로그
  console.log('Header currentPage:', currentPage);
  console.log('Header onLogout function:', typeof onLogout);
  console.log('Header user:', user);
  console.log('Header isDropdownOpen:', isDropdownOpen);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <h1 className={styles.logoText}>Neekly Report</h1>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <button 
            onClick={onCalendarClick}
            className={`${styles.navLink} ${currentPage === 'calendar' ? styles.active : styles.inactive}`}
          >
            Calendar
          </button>
          <button 
            onClick={onTaskClick}
            className={`${styles.navLink} ${currentPage === 'task' ? styles.active : styles.inactive}`}
          >
            Weekly Report
          </button>
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          {/* Search */}
          <button className={styles.actionButton}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Notifications */}
          <button className={`${styles.actionButton} ${styles.notificationButton}`}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className={styles.notificationDot}></span>
          </button>

          {/* Divider */}
          <div className={styles.divider}></div>

          {/* User Profile */}
          <div className={styles.userProfileContainer} ref={dropdownRef}>
            <button className={styles.userProfile} onClick={toggleDropdown}>
              <div className={styles.userAvatar}>
                {user ? getUserInitials(user.email) : 'U'}
              </div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user ? user.email.split('@')[0] : 'User'}</p>
              </div>
              <svg className={styles.userDropdown} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button onClick={handleLogoutClick} className={styles.dropdownItem}>
                  <svg className={styles.dropdownIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;