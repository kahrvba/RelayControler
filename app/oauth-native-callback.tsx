import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Text, View, ActivityIndicator } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'

export default function OAuthNativeCallback() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    // If user is signed in and we haven't redirected yet
    if (isSignedIn && !hasRedirected) {
      setHasRedirected(true)
      router.replace('/')
      return
    }

    // If not signed in after a reasonable delay, redirect to sign-up
    const timer = setTimeout(() => {
      if (!hasRedirected) {
        setHasRedirected(true)
        router.replace('/sign-up')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [router, isSignedIn, isLoaded, hasRedirected])

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white'
    }}>
      <ActivityIndicator size="large" color="#2d3748" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
        Completing authentication...
      </Text>
    </View>
  )
}
