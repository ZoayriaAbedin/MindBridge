import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supportGroupsAPI } from '../services/api';
import './SupportGroups.css';

const SupportGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadGroups();
  }, [filter]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const [allGroupsRes, myGroupsRes] = await Promise.all([
        supportGroupsAPI.getAll({ type: filter !== 'all' ? filter : undefined }),
        supportGroupsAPI.getMyGroups().catch(() => ({ data: { data: [] } })),
      ]);

      setGroups(allGroupsRes.data.data || []);
      setMyGroups(myGroupsRes.data.data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await supportGroupsAPI.join(groupId);
      loadGroups(); // Reload to update the joined status
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      await supportGroupsAPI.leave(groupId);
      loadGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      alert(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const isJoined = (groupId) => {
    return myGroups.some((g) => g.id === groupId);
  };

  const isRecommended = (group) => {
    // Check if group has a recommended flag from therapist
    return group.is_recommended || group.recommended_by_therapist;
  };

  return (
    <div className="support-groups">
      <div className="page-header">
        <h1>Support Groups</h1>
        <p>Connect with others on similar mental health journeys</p>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Groups
          </button>
          <button
            className={`filter-btn ${filter === 'therapy' ? 'active' : ''}`}
            onClick={() => setFilter('therapy')}
          >
            Therapy
          </button>
          <button
            className={`filter-btn ${filter === 'support' ? 'active' : ''}`}
            onClick={() => setFilter('support')}
          >
            Support
          </button>
          <button
            className={`filter-btn ${filter === 'educational' ? 'active' : ''}`}
            onClick={() => setFilter('educational')}
          >
            Educational
          </button>
          <button
            className={`filter-btn ${filter === 'peer' ? 'active' : ''}`}
            onClick={() => setFilter('peer')}
          >
            Peer Support
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading support groups...</div>
      ) : (
        <>
          {myGroups.length > 0 && (
            <div className="my-groups-section">
              <h2>My Groups</h2>
              <div className="groups-grid">
                {myGroups.map((group) => (
                  <div key={group.id} className="group-card joined">
                    <div className="group-header">
                      <h3>{group.name}</h3>
                      <span className="group-badge joined-badge">Joined</span>
                    </div>
                    <p className="group-description">{group.description}</p>
                    <div className="group-meta">
                      <span className="group-type">{group.group_type}</span>
                      <span className="group-members">
                        👥 {group.current_members || 0} / {group.max_members} members
                      </span>
                      <span className="group-mode">
                        {group.meeting_mode === 'online' ? '💻 Online' : 
                         group.meeting_mode === 'in_person' ? '📍 In-Person' : 
                         '🔄 Hybrid'}
                      </span>
                    </div>
                    <div className="group-actions">
                      <Link to={`/support-groups/${group.id}`} className="btn btn-primary">
                        View Group
                      </Link>
                      <button
                        onClick={() => handleLeaveGroup(group.id)}
                        className="btn btn-secondary"
                      >
                        Leave Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="all-groups-section">
            <h2>Available Groups</h2>
            {groups.length > 0 ? (
              <div className="groups-grid">
                {groups.map((group) => (
                  <div 
                    key={group.id} 
                    className={`group-card ${isJoined(group.id) ? 'joined' : ''}`}
                  >
                    <div className="group-header">
                      <h3>{group.name}</h3>
                      <div className="badges">
                        {isRecommended(group) && (
                          <span className="group-badge recommended-badge">
                            ⭐ Recommended by Therapist
                          </span>
                        )}
                        {isJoined(group.id) && (
                          <span className="group-badge joined-badge">Joined</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="group-description">{group.description}</p>
                    
                    <div className="group-details">
                      {group.focus_area && (
                        <p><strong>Focus:</strong> {group.focus_area}</p>
                      )}
                      {group.facilitator_name && (
                        <p><strong>Facilitator:</strong> {group.facilitator_name}</p>
                      )}
                    </div>

                    <div className="group-meta">
                      <span className="group-type">{group.group_type}</span>
                      <span className="group-members">
                        👥 {group.current_members || 0} / {group.max_members} members
                      </span>
                      <span className="group-mode">
                        {group.meeting_mode === 'online' ? '💻 Online' : 
                         group.meeting_mode === 'in_person' ? '📍 In-Person' : 
                         '🔄 Hybrid'}
                      </span>
                    </div>

                    <div className="group-actions">
                      <Link 
                        to={`/support-groups/${group.id}`} 
                        className="btn btn-secondary"
                      >
                        View Details
                      </Link>
                      {!isJoined(group.id) ? (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="btn btn-primary"
                          disabled={group.current_members >= group.max_members}
                        >
                          {group.current_members >= group.max_members ? 'Full' : 'Join Group'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          className="btn btn-danger"
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No support groups available</h3>
                <p>Check back later for new groups</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SupportGroups;
