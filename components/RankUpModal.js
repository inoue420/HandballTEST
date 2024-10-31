
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Button, Animated, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const RankUpModal = ({ visible, onClose, previousRank, currentRank }) => {
  const [showButton, setShowButton] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const animationDuration = 8000; // Duration of the animation
  const numberOfBubbles = 2; // Number of bubbles appearing at a time
  const bubbleColors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#FFC300']; // Array of bubble colors

  const generateBubbles = () => {
    const newBubbles = [];
    for (let i = 0; i < numberOfBubbles; i++) {
      const left = Math.random() * 300;
      const size = Math.random() * (60 - 15) + 15;
      const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
      const translateY = new Animated.Value(0);

      Animated.timing(translateY, {
        toValue: -800,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();

      newBubbles.push({ left, size, color, translateY });
    }
    setBubbles(prev => [...prev, ...newBubbles]);
  };

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        generateBubbles();
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setShowButton(true);
      }, animationDuration);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        setBubbles([]);
      };
    } else {
      setBubbles([]);
      setShowButton(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.congratulations}>おめでとうございます！{'\n'}             {'\n'} </Text>
          <Text style={styles.rankTextContainer}>
            <Text 
              style={styles.rankTextHighlight}
              adjustsFontSizeToFit={true} // フォントサイズを自動調整
              numberOfLines={1} // 1行に収まるように設定
            >
              {previousRank}
            </Text>
            {'\n'} {'\n'} 
            <Text style={styles.baseText}>から</Text>
            {'\n'} {'\n'} 
            <Text 
              style={styles.rankTextHighlight}
              adjustsFontSizeToFit={true} // フォントサイズを自動調整
              numberOfLines={1} // 1行に収まるように設定
            >
              {currentRank}
            </Text>
          </Text>
          <Text style={styles.baseText}>にランクアップしました！ {'\n'}{'\n'}{'\n'} </Text>
          {showButton ? (
            <Button title="閉じる" onPress={onClose} />
                ) : (
            <View style={{ height: 40 }} /> // ボタンと同じ高さのスペースを確保
                    )}
        </View>
        {bubbles.map((bubble, index) => (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              bottom: 0,
              left: bubble.left,
              transform: [{ translateY: bubble.translateY }],
            }}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.5)', bubble.color]}
              style={{
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                opacity: 0.8,
              }}
            />
          </Animated.View>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#E0FFFF',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  congratulations: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rankTextContainer: {
    textAlign: 'center', // テキストを中央揃え
    marginBottom: 20,
  },
  baseText: {
    fontSize: 16,
  },
  rankTextHighlight: {
    fontWeight: 'bold',
    color: '#FF5733',
    marginVertical: 5,
    textAlign: 'center', // テキストを中央揃え
  },
});

export default RankUpModal;
