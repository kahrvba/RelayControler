import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold mb-4">Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          className="w-full p-4 border border-gray-300 rounded-lg mb-4"
          onChangeText={setCode}
        />
        <TouchableOpacity
          onPress={onVerifyPress}
          className="w-full bg-blue-500 p-4 rounded-lg items-center">
          <Text className="text-white font-bold">Verify</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-4">Sign up</Text>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        onChangeText={setEmailAddress}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        onChangeText={setPassword}
      />
      <TouchableOpacity
        onPress={onSignUpPress}
        className="w-full bg-blue-500 p-4 rounded-lg items-center">
        <Text className="text-white font-bold">Continue</Text>
      </TouchableOpacity>
      <View className="flex-row gap-2 mt-4">
        <Text>Already have an account?</Text>
        <Link href="/sign-in">
          <Text className="text-blue-500">Sign in</Text>
        </Link>
      </View>
    </View>
  )
}