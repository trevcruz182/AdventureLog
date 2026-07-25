import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

import type { MappedAdventure } from "@/features/adventures/adventureCoordinates";
import { AppColors, useAppTheme } from "@/theme";

type AdventureMapMarkerProps = {
    adventure: MappedAdventure;
    isSelected: boolean;
    onPress: () => void;
};

const categoryIcons: Record<MappedAdventure["category"], React.ComponentProps<typeof Ionicons>["name"]> = {
    hiking: "trail-sign",
    sports: "trophy",
    travel: "airplane",
    food: "restaurant",
    outdoors: "leaf",
};

export function AdventureMapMarker({adventure, isSelected, onPress}: AdventureMapMarkerProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const isPlanned = adventure.status === "wishlist";

    return(
        <Marker
            coordinate={{
                latitude: adventure.latitudeNumber,
                longitude: adventure.longitudeNumber
            }}
            title={adventure.title}
            description={adventure.location_name}
            onPress={onPress}
            tracksViewChanges={isSelected}
        >
            <View style={[styles.marker, isPlanned && styles.markerPlanned, isSelected && styles.markerSelected]}>
                <Ionicons name={categoryIcons[adventure.category]} size={isSelected ? 20 : 17} color={isSelected ? colors.background : isPlanned ? colors.clay : "#FFFFFF"} />
            </View>

            <View style={[styles.pointer, isPlanned && styles.pointerPlanned, isSelected && styles.pointerSelected]} />
        </Marker>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        marker: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.forest,
            borderWidth: 3,
            borderColor: "#FFFFFF",
            borderRadius: 19,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: 0.24,
            shadowRadius: 4,
            elevation: 5,
        },
        markerSelected: {
            width: 46,
            height: 46,
            backgroundColor: colors.clay,
            borderColor: colors.surface,
            borderRadius: 23,
        },
        markerPlanned: {
            backgroundColor: colors.surface,
            borderColor: colors.clay
        },
        pointerPlanned: {
            backgroundColor: colors.clay
        },
        pointer: {
            width: 10,
            height: 10,
            alignSelf: "center",
            marginTop: -6,
            backgroundColor: colors.forest,
            transform: [{rotate: "45deg"}]
        },
        pointerSelected: {
            backgroundColor: colors.clay,
        }
    });
}
