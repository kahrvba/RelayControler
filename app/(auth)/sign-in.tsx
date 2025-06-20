import { useOAuth, useSignIn } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLanguage } from "../../components/LanguageProvider"

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const { t } = useLanguage()

  const [phone, setPhone] = React.useState('')
  const [code, setCode] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

  const onGoogleSignInPress = React.useCallback(async () => {
    setError('')
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow()

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
    }
  }, [])

  const onPhoneSignInPress = async () => {
    if (!isLoaded || loading) return
    setLoading(true)
    setError('')
    try {
      const signInAttempt = await signIn.create({
        identifier: phone,
      })

      if (signInAttempt.status === 'needs_first_factor') {
        setVerifying(true)
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors[0]?.message || t('auth.signInError'))
    } finally {
      setLoading(false)
    }
  }

  const onVerifyCodePress = async () => {
    if (!isLoaded || loading) return
    setLoading(true)
    setError('')
    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code,
      })

      if (signInAttempt.status === 'complete') {
        if (setActive) {
          await setActive({ session: signInAttempt.createdSessionId })
          router.replace('/')
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors[0]?.message || t('auth.signInError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <Image
          source={{ uri: 'https://innovia-iskibris.s3.eu-west-2.amazonaws.com/12431_60aca802603c6.png' }}
          style={styles.logo}
        />
        <Text style={styles.title}>{t('auth.signInToAlemdar')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.welcomeBack')}
        </Text>

        <TouchableOpacity
          style={[styles.socialButton, { marginBottom: 24 }]}
          onPress={onGoogleSignInPress}>
          <FontAwesome name="google" size={24} color="black" />
          <Text style={styles.socialButtonText}>{t('auth.signInWithGoogle')}</Text>
        </TouchableOpacity>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>{t('auth.or')}</Text>
          <View style={styles.separatorLine} />
        </View>

        {!verifying && (
          <>
            <Text style={styles.label}>{t('auth.phoneNumber')}</Text>
            <TextInput
              value={phone}
              placeholder={t('auth.enterPhoneNumber')}
              style={styles.input}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              onPress={onPhoneSignInPress}
              style={styles.button}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.verify')}</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {verifying && (
          <>
            <Text style={styles.label}>{t('auth.verificationCode')}</Text>
            <TextInput
              value={code}
              placeholder={t('auth.enterVerificationCode')}
              style={styles.input}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={onVerifyCodePress}
              style={styles.button}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.verify')}</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.footer}>
        <Text>{t('auth.dontHaveAccount')}</Text>
        <Link href="/sign-up">
          <Text style={styles.link}>{t('auth.signUp')}</Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  },
  socialButtonText: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  separatorText: {
    marginHorizontal: 8,
    color: '#6b7280',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#2d3748',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
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