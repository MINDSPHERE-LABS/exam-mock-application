import { useState } from 'react';

export default function ProfileScreen({ user, handleSaveProfile, handleLogout, setCurrentScreen, showToast }) {
  const [editFirstName, setEditFirstName] = useState(user.first_name || '');
  const [editLastName, setEditLastName] = useState(user.last_name || '');
  const [editEmail, setEditEmail] = useState(user.email || '');

  // Crop & Adjust states
  const [fileInputRef, setFileInputRef] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageRef, setImageRef] = useState(null);
  const [imgMeta, setImgMeta] = useState({ w: 0, h: 0, initX: 0, initY: 0 });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setImgMeta({ w: 0, h: 0, initX: 0, initY: 0 });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const minScale = 250 / Math.min(naturalWidth, naturalHeight);
    const w = naturalWidth * minScale;
    const h = naturalHeight * minScale;

    const initX = (250 - w) / 2;
    const initY = (250 - h) / 2;

    setImgMeta({ w, h, initX, initY });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleSaveCrop = () => {
    if (!imageRef || imgMeta.w === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    const w = imgMeta.w * zoom;
    const h = imgMeta.h * zoom;

    const initX = imgMeta.initX - (w - imgMeta.w) / 2;
    const initY = imgMeta.initY - (h - imgMeta.h) / 2;

    const offsetX = initX + pan.x;
    const offsetY = initY + pan.y;

    ctx.drawImage(imageRef, offsetX - 35, offsetY - 35, w, h);

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
    
    handleSaveProfile({
      first_name: editFirstName,
      last_name: editLastName,
      email: editEmail,
      avatar_url: croppedBase64
    });

    setCropModalOpen(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSaveProfile({
      first_name: editFirstName,
      last_name: editLastName,
      email: editEmail,
      avatar_url: user.avatar_url
    });
  };

  return (
    <div className="profile-screen-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="app-header-rankora" style={{ marginBottom: '4px' }}>
        <div className="header-back-title">
          <button className="back-btn" onClick={() => setCurrentScreen('home')} aria-label="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h3 className="header-title-text" style={{ fontSize: '15px' }}>Profile</h3>
        </div>
        <button className="back-btn" onClick={() => showToast("No new notifications.", "info")} aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>

      {/* Avatar section */}
      <div className="profile-card-top">
        <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '12px' }}>
          <div className="profile-avatar-frame" style={{ margin: 0, width: '100%', height: '100%' }}>
            <img 
              alt="Student Profile" 
              className="avatar-nav-img" 
              src={user.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBLcMYXUoRYHqj-tRbU-sUcWynOSjha_9CPpSCDRR4gdPn-lYfLsiQ7PslCWf8xa72DGxU5wiBKkupg3emMH9mXJZHvy1HV_Ezn0R23rhIxXx_hwGiwVF-BxNcydSw2_oRcH14o-HV6xehNBObaqwtHTjkz_xrBplTzwtdLZjx5VHmDiKk2uERRT3bJF4pEqFbSLTFcxs0fdtfy70Axej2vIoPmRuxlEJ5KhpwsFabQP0G_CPrX9X3_1-H3HgIQW9X5NTyaHivpZQg"} 
            />
          </div>
          <div 
            className="avatar-camera-btn" 
            onClick={() => fileInputRef.click()} 
            style={{ 
              position: 'absolute', 
              bottom: '-4px', 
              right: '-4px', 
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#000000' }}>photo_camera</span>
          </div>
          <input 
            type="file" 
            ref={el => setFileInputRef(el)} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        <h3 className="profile-username-lbl">{user.first_name} {user.last_name}</h3>
        <span className="profile-rank-badge">{(user.rank_name || "Elite Rankora 42").replace("Rank ", "Rankora ")}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Total Points: {(user.points ?? 0).toLocaleString()}</span>
      </div>

      {/* Profile Details Block */}
      <form onSubmit={onSubmit} className="profile-sections-stack" style={{ marginBottom: '16px' }}>
        <div className="profile-section-block glass-card">
          <h4 className="profile-section-title">Identity Details</h4>
          
          <div className="auth-form-group" style={{ marginBottom: 0 }}>
            <div className="auth-name-row">
              <div className="input-field-container">
                <label className="input-label">First Name</label>
                <input 
                  type="text" 
                  className="auth-input"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                />
              </div>
              <div className="input-field-container">
                <label className="input-label">Last Name</label>
                <input 
                  type="text" 
                  className="auth-input"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="input-field-container">
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="auth-input"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="profile-section-block glass-card">
          <div className="input-field-container">
            <label className="input-label">Mobile Number</label>
            <input 
              type="text" 
              className="auth-input"
              disabled
              value={`+91 ${user.mobile}`}
              style={{ opacity: 0.6 }}
            />
          </div>
        </div>

        <div className="profile-actions-row">
          <button type="submit" className="orange-submit-btn gold-shimmer">
            Save Changes
          </button>
          <span className="cancel-profile-btn" onClick={() => setCurrentScreen('home')}>Cancel</span>
        </div>
      </form>

      {/* Crop Modal */}
      {cropModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div className="glass-card" style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Crop Profile Picture</h4>
            
            <div style={{
              width: '250px',
              height: '250px',
              backgroundColor: '#090d16',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'move'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            >
              {selectedImage && (
                <img
                  src={selectedImage}
                  onLoad={handleImageLoad}
                  ref={el => setImageRef(el)}
                  alt="To Crop"
                  draggable={false}
                  style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    width: imgMeta.w ? `${imgMeta.w}px` : '100%',
                    height: imgMeta.h ? `${imgMeta.h}px` : '100%',
                    left: imgMeta.w ? `${imgMeta.initX}px` : '0px',
                    top: imgMeta.h ? `${imgMeta.initY}px` : '0px',
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease'
                  }}
                />
              )}
              
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                border: '2px dashed var(--secondary)',
                borderRadius: '50%',
                boxSizing: 'border-box',
                margin: '35px',
                width: '180px',
                height: '180px'
              }} />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Zoom: {zoom.toFixed(1)}x</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--secondary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
              <button 
                type="button" 
                style={{ 
                  background: '#334155', 
                  color: '#fff', 
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none'
                }}
                onClick={() => setCropModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                style={{ 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                  color: '#020617', 
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.2)'
                }}
                onClick={handleSaveCrop}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
