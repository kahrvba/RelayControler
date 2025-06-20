import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from './LanguageProvider';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, setLanguage, supportedLanguages } = useLanguage();

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      await setLanguage(languageCode as 'en' | 'tr');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {supportedLanguages.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageButton,
            currentLanguage === language.code && styles.activeLanguageButton
          ]}
          onPress={() => handleLanguageChange(language.code)}
        >
          <Text style={styles.flag}>{language.flag}</Text>
          <Text style={[
            styles.languageText,
            currentLanguage === language.code && styles.activeLanguageText
          ]}>
            {language.nativeName}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  activeLanguageButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activeLanguageText: {
    color: '#FFFFFF',
  },
}); 