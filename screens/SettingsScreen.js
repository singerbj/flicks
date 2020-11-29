import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../components/AppButton';
import SafeView from '../components/SafeView';
import { logout, likeMedia, dislikeMedia } from '../components/Firebase/firebase';
import colors from '../utils/colors';

export default SettingsScreen = () => {
    const handleSignOut = async () => {
        try {
            await logout();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeView style={styles.container}>
            <View style={{ width: '100%'}}>
                <Button
                    title="Sign Out" 
                    onPress={handleSignOut}
                />
            </View>
        </SafeView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
