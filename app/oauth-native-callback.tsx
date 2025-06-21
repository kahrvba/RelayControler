import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'

export default function OAuthNativeCallback() {
  const router = useRouter()

  useEffect(() => {
    // This screen will be shown briefly during OAuth redirect
    // Clerk will handle the OAuth flow automatically
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.replace('/')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Completing authentication...</Text>
    </View>
  )
}
