import { StyleSheet, Text } from "react-native";

import { spacing, useAppTheme } from "@/theme";

type FieldErrorProps = {
    message?: string;
};

export function FieldError({message}: FieldErrorProps) {
    const {colors} = useAppTheme();

    if(!message) {
        return null;
    }

    return(
        <Text accessibilityRole="alert" style={[styles.error, {color: colors.danger}]}>
            {message}
        </Text>
    );
}

const styles = StyleSheet.create({
    error: {
        marginTop: spacing.sm,
        fontSize: 12,
        fontWeight: "700",
    }
});