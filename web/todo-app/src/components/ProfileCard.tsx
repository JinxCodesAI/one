import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import type { ProfileCardProps } from '../types.ts';

export function ProfileCard({ profile, credits, onUpdateProfile, onClaimBonus }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name || '',
    avatarUrl: profile.avatarUrl || ''
  });
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);

  const handleSaveProfile = async () => {
    try {
      await onUpdateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleClaimBonus = async () => {
    setIsClaimingBonus(true);
    try {
      await onClaimBonus();
    } catch (error) {
      console.error('Error claiming bonus:', error);
    } finally {
      setIsClaimingBonus(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile.avatarUrl) return profile.avatarUrl;
    // Generate a simple avatar based on name or ID
    const seed = profile.name || profile.anonId;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b82f6&textColor=ffffff`;
  };

  return (
    <div className="card profile-card">
      <div className="profile-header">
        <div className="avatar">
          <img src={getAvatarUrl()} alt="Profile" />
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                className="input"
                placeholder="Your name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="edit-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveProfile}>
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="profile-name">
                {profile.name || 'Anonymous User'}
              </h3>
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="credits-section">
        <div className="credits-header">
          <h4>Credits</h4>
          <span className="credits-balance">{credits.balance}</span>
        </div>
        
        <button
          type="button"
          className="btn btn-success btn-full"
          onClick={handleClaimBonus}
          disabled={isClaimingBonus}
        >
          {isClaimingBonus ? (
            <>
              <LoadingSpinner size="small" color="white" />
              Claiming...
            </>
          ) : (
            '🎁 Claim Daily Bonus'
          )}
        </button>

        {credits.ledger.length > 0 && (
          <div className="recent-transactions">
            <h5>Recent Activity</h5>
            <div className="transaction-list">
              {credits.ledger.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-reason">{transaction.reason}</span>
                    <span className="transaction-date">
                      {new Date(transaction.ts).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .profile-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .profile-info {
          flex: 1;
        }
        
        .profile-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }
        
        .edit-profile-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }
        
        .edit-profile-btn:hover {
          color: white;
        }
        
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .edit-form .input {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-size: 0.875rem;
          padding: 0.5rem;
        }
        
        .edit-form .input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }
        
        .credits-section {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 1rem;
        }
        
        .credits-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .credits-header h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }
        
        .credits-balance {
          font-size: 1.5rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
        }
        
        .btn-full {
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .recent-transactions h5 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          opacity: 0.9;
        }
        
        .transaction-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 0.75rem;
        }
        
        .transaction-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .transaction-reason {
          font-weight: 500;
        }
        
        .transaction-date {
          opacity: 0.7;
          font-size: 0.6875rem;
        }
        
        .transaction-amount {
          font-weight: 600;
        }
        
        .transaction-amount.positive {
          color: #10b981;
        }
        
        .transaction-amount.negative {
          color: #f87171;
        }
      `}</style>
    </div>
  );
}
