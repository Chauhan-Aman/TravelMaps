import { useEffect, useState } from 'react';
import { StyleSheet, Alert, View, Image, Text } from 'react-native';

import { getCurrentPositionAsync, useForegroundPermissions, PermissionStatus } from 'expo-location';

import { Colors } from '../../constants/colors';
import OutlinedButton from '../UI/OutlinedButton';

import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';

import { getMapPreview } from '../../util/location';

const LocationPicker = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();   //true when this component in main screen on device otherwise it is false

    const [pickedLocation, setPickedLocation] = useState();

    const [locationPermissionInformation, requestPermission] = useForegroundPermissions();

    useEffect(() => {

        if (isFocused && route.params) {
            const mapPickedLocation = {
                lat: route.params.pickedLat,
                lng: route.params.pickedLng
            };
            setPickedLocation(mapPickedLocation);
        };

    }, [route, isFocused]);

    async function verifyPermissions() {
        if (locationPermissionInformation.status === PermissionStatus.UNDETERMINED) {
            const permissionResponse = await requestPermission();

            return permissionResponse.granted;   // True or False - True if camera access is granted
        }

        if (locationPermissionInformation.status === PermissionStatus.DENIED) {
            Alert.alert(
                'Insufficient Permissions!',
                'You need to grant location Permissions to use this app.'
            );

            return false;
        }

        return true;  // Neither DENIED nor UNDETERMINED - GRANTED
    }

    async function getLocationHandler() {
        const hasPermission = await verifyPermissions();

        if (!hasPermission) {
            return;
        }

        const location = await getCurrentPositionAsync();
        setPickedLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
        });
    }

    function pickOnMapHandler() {
        navigation.navigate('Map')
    }

    let locationPreview = <Text>No Location Picked Yet.</Text>

    if (pickedLocation) {
        imagePreview = (
            <Image
                style={styles.image}
                source={{
                    uri: getMapPreview(pickedLocation.lat, pickedLocation.lng)
                }}
            />
        );
    }

    return (
        <View>
            <View style={styles.mapPreview}>
                {locationPreview}
            </View>
            <View style={styles.actions}>
                <OutlinedButton icon='location' onPress={getLocationHandler}>Locate User</OutlinedButton>
                <OutlinedButton icon='map' onPress={pickOnMapHandler}>Pick on Map</OutlinedButton>
            </View>
        </View>
    )
}

export default LocationPicker;

const styles = StyleSheet.create({
    mapPreview: {
        width: '100%',
        height: 200,
        marginVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary100,
        borderRadius: 4,
        overflow: 'hidden',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    }
});