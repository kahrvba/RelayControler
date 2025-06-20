import { ResizeMode, Video } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface VideoSplashScreenProps {
  onVideoComplete: () => void;
}

export const VideoSplashScreen: React.FC<VideoSplashScreenProps> = ({ onVideoComplete }) => {
  const videoRef = useRef<Video>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Keep the splash screen visible while we're showing the video
    SplashScreen.preventAutoHideAsync();
    
    // Fallback timer in case video doesn't trigger onEnd
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback timer triggered - proceeding to main app');
      handleVideoComplete();
    }, 5000); // 5 seconds fallback

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleVideoComplete = async () => {
    console.log('Video splash screen complete - transitioning to main app');
    try {
      // Hide the splash screen and notify parent component
      await SplashScreen.hideAsync();
      onVideoComplete();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
      onVideoComplete();
    }
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setIsVideoLoaded(true);
  };

  const handleVideoError = async (error: any) => {
    console.error('Video splash screen error:', error);
    // If video fails to load, still hide splash screen and continue
    handleVideoComplete();
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.didJustFinish) {
      console.log('Video playback status: finished');
      handleVideoComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/video/application start.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={false}
        isMuted={true}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: width,
    height: height,
  },
}); 