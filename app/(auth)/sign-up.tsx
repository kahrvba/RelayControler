import { useOAuth, useSignUp } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSelector } from "../../components/LanguageSelector"

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const { startOAuthFlow } = useOAuth({
    strategy: 'oauth_google',
    redirectUrl: 'com.alemdarteknik://oauth-native-callback'
  })
  const { t } = useLanguage()

  const onGoogleSignUpPress = React.useCallback(async () => {
    setError('')
    try {
      const { createdSessionId, setActive } = await startOAuthFlow()

      if (createdSessionId) {
        if (setActive) {
          setActive({ session: createdSessionId })
          router.replace('/')
        }
      } else {
        // Use signUp for next steps such as MFA
      }
    } catch (err: any) {
      console.error('OAuth error', err)
      setError(err.errors[0]?.message || 'An error occurred.')
    }
  }, [router, startOAuthFlow])

  const onPhoneSignUpPress = async () => {
    if (!isLoaded || loading) return
    setLoading(true)
    setError('')

    try {
      await signUp.create({
        phoneNumber: phone,
        password,
      })

      await signUp.preparePhoneNumberVerification()
      setVerifying(true)
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors[0]?.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const onVerifyCodePress = async () => {
    if (!isLoaded || loading) return
    setLoading(true)
    setError('')

    try {
      const signUpAttempt = await signUp.attemptPhoneNumberVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors[0]?.message || t('auth.signUpError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <Image
          source={{ uri: 'https://innovia-iskibris.s3.eu-west-2.amazonaws.com/12431_60aca802603c6.png' }}
          style={styles.logo}
        />
        <LanguageSelector />
        <Text style={styles.title}>{t('auth.createAccount')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.welcome')}
        </Text>

        <TouchableOpacity
          style={[styles.socialButton, { marginBottom: 24 }]}
          onPress={onGoogleSignUpPress}>
          <FontAwesome name="google" size={24} color="black" />
          <Text style={styles.socialButtonText}>{t('auth.signUpWithGoogle')}</Text>
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
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput
              value={password}
              placeholder="••••••••"
              secureTextEntry={true}
              style={styles.input}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={onPhoneSignUpPress}
              style={styles.button}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>{t('common.next')}</Text>
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
              <Text>{t('auth.alreadyHaveAccount')}</Text>
              <Link href="/sign-in">
                <Text style={styles.link}>{t('auth.signIn')}</Text>
              </Link>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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
    display: 'flex',
    textAlign: 'center',
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