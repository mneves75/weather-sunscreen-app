import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSunscreen } from '../../context/SunscreenContext';
import { useWeather } from '../../context/WeatherContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LiquidGlassWrapper, ExpoGlassContainer } from '../../components/glass/LiquidGlassWrapper';

// Body parts keys - translations handled in component
const BODY_PARTS_KEYS = ['Face', 'Arms', 'Legs', 'Torso', 'Back', 'Hands', 'Feet'];
const SPF_OPTIONS = [15, 30, 50, 100];

export function SunscreenTrackerScreen() {
  const { t } = useTranslation();
  const { 
    applications, 
    reapplicationStatus, 
    isLoading, 
    error, 
    logApplication, 
    clearError,
    userProfile 
  } = useSunscreen();
  
  const { weatherData } = useWeather();
  
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedSPF, setSelectedSPF] = useState(30);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(['Face', 'Arms']);
  
  // Helper function to get localized body part names
  const getLocalizedBodyParts = (parts: string[]): string => {
    return parts.map(part => t(`bodyParts.${part}`)).join(', ');
  };
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (userProfile) {
      setSelectedSPF(userProfile.preferredSPF);
      setSelectedBodyParts(userProfile.bodyPartsToTrack);
    }
  }, [userProfile]);

  const handleLogApplication = async () => {
    if (selectedBodyParts.length === 0) {
      Alert.alert(t('sunscreen.modal.selectionRequired'), t('sunscreen.modal.selectBodyPart'));
      return;
    }

    try {
      await logApplication(selectedSPF, selectedBodyParts, notes.trim() || undefined);
      setShowApplicationModal(false);
      setNotes('');
      Alert.alert(
        t('sunscreen.modal.success'), 
        t('sunscreen.modal.successMessage', { spf: selectedSPF })
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('sunscreen.modal.error'));
    }
  };

  const toggleBodyPart = (part: string) => {
    setSelectedBodyParts(prev => 
      prev.includes(part) 
        ? prev.filter(p => p !== part)
        : [...prev, part]
    );
  };

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes <= 0) return 'Now!';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading && applications.length === 0) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={clearError} />;
  }

  const currentUV = weatherData?.uvIndex.value || 0;
  const uvColor = getUVColor(currentUV);

  return (
    <ScrollView style={styles.container}>
      {/* Current Status Card with Liquid Glass Effect */}
      <LiquidGlassWrapper variant="prominent" style={styles.statusCard}>
        <Text style={styles.statusTitle}>{t('sunscreen.title')}</Text>
        
        {weatherData && (
          <View style={styles.uvInfo}>
            <Text style={styles.location}>{weatherData.location.name}</Text>
            <View style={styles.uvRow}>
              <Text style={styles.uvLabel}>UV Index:</Text>
              <Text style={[styles.uvValue, { color: uvColor }]}>
                {currentUV} ({weatherData.uvIndex.level})
              </Text>
            </View>
          </View>
        )}

        {reapplicationStatus.nextApplication ? (
          <View style={[
            styles.reapplicationStatus, 
            { backgroundColor: reapplicationStatus.isDue ? '#FFF3CD' : '#D4F6D4' }
          ]}>
            <Text style={styles.reapplicationTitle}>
              {reapplicationStatus.isDue ? t('sunscreen.reapplicationDue') : t('sunscreen.protected')}
            </Text>
            <Text style={styles.reapplicationTime}>
              {reapplicationStatus.isDue 
                ? t('sunscreen.applyNow') 
                : t('sunscreen.nextReapplication', { time: formatTimeRemaining(reapplicationStatus.timeRemaining || 0) })}
            </Text>
            <Text style={styles.lastApplication}>
              {t('sunscreen.lastApplied', { 
                spf: reapplicationStatus.nextApplication.spf,
                time: reapplicationStatus.nextApplication.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              })}
            </Text>
          </View>
        ) : (
          <View style={[styles.reapplicationStatus, { backgroundColor: '#FFE6E6' }]}>
            <Text style={styles.reapplicationTitle}>{t('sunscreen.noProtection')}</Text>
            <Text style={styles.reapplicationTime}>{t('sunscreen.applyNow')}</Text>
            <Text style={styles.lastApplication}>{t('sunscreen.noRecentApplications')}</Text>
          </View>
        )}
      </LiquidGlassWrapper>

      {/* Log New Application Button */}
      <TouchableOpacity 
        style={[styles.logButton, reapplicationStatus.isDue && styles.logButtonUrgent]}
        onPress={() => setShowApplicationModal(true)}
      >
        <Text style={styles.logButtonText}>
          {reapplicationStatus.isDue ? t('sunscreen.reapplyButton') : t('sunscreen.logButton')}
        </Text>
      </TouchableOpacity>

      {/* Recent Applications */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>{t('sunscreen.recentApplications')}</Text>
        
        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>📝</Text>
            <Text style={styles.emptyStateMessage}>{t('sunscreen.emptyState.title')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t('sunscreen.emptyState.subtitle')}
            </Text>
          </View>
        ) : (
          applications.map((app, index) => (
            <ExpoGlassContainer key={app.id}>
              <View style={styles.applicationContent}>
                <View style={styles.applicationHeader}>
                <Text style={styles.applicationSPF}>SPF {app.spf}</Text>
                <Text style={styles.applicationTime}>
                  {app.timestamp.toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              
              <Text style={styles.applicationLocation}>📍 {app.location.name}</Text>
              <Text style={styles.applicationUV}>{t('sunscreen.uvIndex', { value: app.uvIndex })}</Text>
              <Text style={styles.applicationBodyParts}>
                {t('sunscreen.appliedTo', { bodyParts: getLocalizedBodyParts(app.bodyParts) })}
              </Text>
              
              {app.notes && (
                <Text style={styles.applicationNotes}>{t('sunscreen.note', { note: app.notes })}</Text>
              )}
              </View>
            </ExpoGlassContainer>
          ))
        )}
      </View>

      {/* Application Modal */}
      <Modal
        visible={showApplicationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
              <Text style={styles.modalCancelButton}>{t('sunscreen.modal.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('sunscreen.modal.title')}</Text>
            <TouchableOpacity onPress={handleLogApplication}>
              <Text style={styles.modalSaveButton}>{t('sunscreen.modal.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* SPF Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>{t('sunscreen.modal.spfLevel')}</Text>
              <View style={styles.spfOptions}>
                {SPF_OPTIONS.map(spf => (
                  <TouchableOpacity
                    key={spf}
                    style={[
                      styles.spfOption,
                      selectedSPF === spf && styles.spfOptionSelected
                    ]}
                    onPress={() => setSelectedSPF(spf)}
                  >
                    <Text style={[
                      styles.spfOptionText,
                      selectedSPF === spf && styles.spfOptionTextSelected
                    ]}>
                      {spf}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Body Parts Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>{t('sunscreen.modal.bodyParts')}</Text>
              <View style={styles.bodyPartsGrid}>
                {BODY_PARTS_KEYS.map(part => (
                  <TouchableOpacity
                    key={part}
                    style={[
                      styles.bodyPartOption,
                      selectedBodyParts.includes(part) && styles.bodyPartOptionSelected
                    ]}
                    onPress={() => toggleBodyPart(part)}
                  >
                    <Text style={[
                      styles.bodyPartOptionText,
                      selectedBodyParts.includes(part) && styles.bodyPartOptionTextSelected
                    ]}>
                      {t(`bodyParts.${part}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>{t('sunscreen.modal.notes')}</Text>
              <TextInput
                style={styles.notesInput}
                placeholder={t('sunscreen.modal.notesPlaceholder')}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Current Conditions Info */}
            {weatherData && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>{t('sunscreen.modal.currentConditions')}</Text>
                <View style={styles.conditionsInfo}>
                  <Text style={styles.conditionsText}>📍 {weatherData.location.name}</Text>
                  <Text style={styles.conditionsText}>
                    ☀️ {t('sunscreen.uvIndex', { value: currentUV })} ({weatherData.uvIndex.level})
                  </Text>
                  <Text style={styles.conditionsText}>
                    🌡️ {t('units.temperature', { temp: Math.round(weatherData.current.temperature) })}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

function getUVColor(uvValue: number): string {
  if (uvValue <= 2) return '#289D00'; // Low - Green
  if (uvValue <= 5) return '#F7D908'; // Moderate - Yellow
  if (uvValue <= 7) return '#F85D00'; // High - Orange
  if (uvValue <= 10) return '#E90B00'; // Very High - Red
  return '#B33DAD'; // Extreme - Violet
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  statusCard: {
    margin: 20,
    padding: 20,
    // backgroundColor removed - handled by LiquidGlassWrapper
    // borderRadius handled by LiquidGlassWrapper
    // shadow handled by LiquidGlassWrapper
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  uvInfo: {
    marginBottom: 16,
  },
  location: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  uvRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uvLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginRight: 8,
  },
  uvValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  reapplicationStatus: {
    padding: 16,
    borderRadius: 8,
  },
  reapplicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  reapplicationTime: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  lastApplication: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  logButton: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logButtonUrgent: {
    backgroundColor: '#E74C3C',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  historySection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  applicationContent: {
    padding: 16,
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationSPF: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  applicationTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  applicationLocation: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  applicationUV: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  applicationBodyParts: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  applicationNotes: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FD',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FD',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  spfOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spfOption: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E8F4FD',
    alignItems: 'center',
  },
  spfOptionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E8F4FD',
  },
  spfOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  spfOptionTextSelected: {
    color: '#4A90E2',
  },
  bodyPartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  bodyPartOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  bodyPartOptionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E8F4FD',
  },
  bodyPartOptionText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  bodyPartOptionTextSelected: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E8F4FD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  conditionsInfo: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
  },
  conditionsText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
});