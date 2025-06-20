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
  const [videoCompleted, setVideoCompleted] = useState(false);

  const handleVideoComplete = React.useCallback(async () => {
    if (videoCompleted) return; // Prevent multiple calls
    setVideoCompleted(true);
    
    console.log('Video splash screen complete - transitioning to main app');
    try {
      // Hide the splash screen and notify parent component
      await SplashScreen.hideAsync();
      onVideoComplete();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
      onVideoComplete();
    }
  }, [onVideoComplete, videoCompleted]);

  useEffect(() => {
    // Keep the splash screen visible while we're showing the video
    SplashScreen.preventAutoHideAsync();
    
    // Fallback timer in case video doesn't trigger onEnd
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback timer triggered - proceeding to main app');
      handleVideoComplete();
    }, 10000); // Increased to 10 seconds to give video more time

    return () => clearTimeout(fallbackTimer);
  }, [handleVideoComplete]);

  const handleVideoLoad = (data: any) => {
    console.log('Video loaded successfully', data);
    if (data.durationMillis) {
      console.log('Video duration:', data.durationMillis / 1000, 'seconds');
    }
  };

  const handleVideoError = async (error: any) => {
    console.error('Video splash screen error:', error);
    // If video fails to load, still hide splash screen and continue
    handleVideoComplete();
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    console.log('Playback status update:', {
      isLoaded: status.isLoaded,
      isPlaying: status.isPlaying,
      positionMillis: status.positionMillis,
      durationMillis: status.durationMillis,
      didJustFinish: status.didJustFinish
    });
    
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