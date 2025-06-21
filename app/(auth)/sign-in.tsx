import { useOAuth } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSelector } from "../../components/LanguageSelector"

export default function Page() {
  const router = useRouter()
  const { t } = useLanguage()
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const { startOAuthFlow } = useOAuth({
    strategy: 'oauth_google',
    redirectUrl: 'com.alemdarteknik://oauth-native-callback'
  })

  const onGoogleSignInPress = React.useCallback(async () => {
    if (loading) return // Prevent multiple simultaneous requests

    setError('')
    setLoading(true)

    try {
      const { createdSessionId, setActive } = await startOAuthFlow()

      if (createdSessionId) {
        if (setActive) {
          setActive({ session: createdSessionId })
          router.replace('/')
        }
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err: any) {
      console.error('OAuth error', err)
      setError(err.errors[0]?.message || t('auth.signInError'))
    } finally {
      setLoading(false)
    }
  }, [router, startOAuthFlow, t, loading])

  // Cleanup function to reset state when component unmounts
  React.useEffect(() => {
    return () => {
      setError('')
      setLoading(false)
    }
  }, [])



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContainer}>
        <View style={styles.card}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <Image
            source={{ uri: 'https://innovia-iskibris.s3.eu-west-2.amazonaws.com/12431_60aca802603c6.png' }}
            style={styles.logo}
          />
          <LanguageSelector />
          <Text style={styles.title}>{t('auth.signInToAlemdar')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.welcomeBack')}
          </Text>

          <TouchableOpacity
            style={[styles.socialButton, loading && styles.socialButtonDisabled]}
            onPress={onGoogleSignInPress}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#666" />
            ) : (
              <>
                <FontAwesome name="google" size={24} color="black" />
                <Text style={styles.socialButtonText}>{t('auth.signInWithGoogle')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text>{t('auth.dontHaveAccount')}</Text>
          <Link href="/sign-up">
            <Text style={styles.link}>{t('auth.signUp')}</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 24,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialButtonText: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  link: {
    color: '#2d3748',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
})