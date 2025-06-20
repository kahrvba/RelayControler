import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onClose }) => {
  const { currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const { colors, isDarkMode } = useTheme();

  const handleLanguageSelect = async (languageCode: string) => {
    await setLanguage(languageCode as 'en' | 'tr');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          maxHeight: '80%',
          shadowColor: colors.shadow,
          shadowOpacity: isDarkMode ? 0.3 : 0.2,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            {t('settings.selectLanguage')}
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 24,
            textAlign: 'center',
          }}>
            {t('settings.selectLanguage')}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {supportedLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  marginBottom: 8,
                  backgroundColor: currentLanguage === language.code 
                    ? colors.primary + '20' 
                    : 'transparent',
                  borderWidth: 2,
                  borderColor: currentLanguage === language.code 
                    ? colors.primary 
                    : colors.border,
                }}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text style={{ fontSize: 24, marginRight: 16 }}>
                  {language.flag}
                </Text>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 2,
                  }}>
                    {language.nativeName}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}>
                    {language.name}
                  </Text>
                </View>

                {currentLanguage === language.code && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={{
              backgroundColor: colors.border,
              borderRadius: 12,
              paddingVertical: 16,
              marginTop: 16,
              alignItems: 'center',
            }}
            onPress={onClose}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
            }}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 