// src/components/TimerCircle.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  remaining: number;
  total: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
};

function formatTime(s: number) {
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TimerCircle({ remaining, total, onStart, onPause, onReset, isRunning }: Props) {
  const display = formatTime(remaining);

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.timeText}>{display}</Text>

        <View style={styles.controls}>
          <TouchableOpacity onPress={isRunning ? onPause : onStart} style={styles.btn}>
            <Text style={styles.btnText}>{isRunning ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onReset} style={[styles.btn, styles.resetBtn]}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(100, (remaining / Math.max(1, total)) * 100))}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ alignItems:'center', marginTop:24, width:'100%'},
  circle:{
    width:300, height:300, borderRadius:150, backgroundColor:'#7AD3A5', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.12, elevation:6
  },
  timeText:{ fontSize:48, fontWeight:'800', color:'#05386b' },
  controls:{ flexDirection:'row', marginTop:18 },
  btn:{ paddingHorizontal:20, paddingVertical:10, backgroundColor:'#05386b', borderRadius:12, marginHorizontal:8 },
  btnText:{ color:'#fff', fontWeight:'700' },
  resetBtn:{ backgroundColor:'#e6f2ea' },
  resetText:{ color:'#05386b', fontWeight:'700' },
  progressContainer:{ width:'70%', marginTop:18, height:10, backgroundColor:'#e6f2ea', borderRadius:8, overflow:'hidden' },
  progressBar:{ height:'100%', backgroundColor:'#05386b' }
});
