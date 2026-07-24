import { Ionicons } from "@expo/vector-icons";
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import { cancelAdventureReminder, scheduleAdventureReminder } from "@/lib/notifications/adventureReminders";
import { getAdventureReminder } from "@/lib/notifications/reminderStorage";
import type { AdventureReminder } from "@/types/reminder";
import { AppColors, spacing, useAppTheme } from "@/theme";

type PlannedAdventureReminderCardProps = {
    adventureId: string;
    adventureTitle: string;
    adventureDate: string;
};

type ReminderOption = {
    id: "morning" | "day" | "week";
    label: string;
    description: string;
    reminderAt: Date;
};

function createReminderDate(adventureDate: string, daysBefore: number): Date {
    const [year, month, day] = adventureDate.split("-").map(Number);

    const reminderDate = new Date(year, month-1, day, 9, 0, 0, 0);

    reminderDate.setDate(reminderDate.getDate() - daysBefore);

    return reminderDate;
}

function formatReminderDate(value: Date | string): string {
    const date = typeof value === "string" ? new Date(value) : value;

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
}

export function PlannedAdventureReminderCard({adventureId, adventureDate, adventureTitle}: PlannedAdventureReminderCardProps) {
    const {colors} = useAppTheme();
    const styles = createStyles(colors);

    const [reminder, setReminder] = useState<AdventureReminder | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const [isWorking, setIsWorking] = useState(false);

    const reminderOptions = useMemo<ReminderOption[]>(
        () => [
            {
                id: "morning",
                label: "Morning of",
                description: "9:00 AM",
                reminderAt: createReminderDate(adventureDate, 0)
            },
            {
                id: "day",
                label: "One day before",
                description: "9:00 AM",
                reminderAt: createReminderDate(adventureDate, 1)
            },
            {
                id: "week",
                label: "One week before",
                description: "9:00 AM",
                reminderAt: createReminderDate(adventureDate, 7)
            },
        ], [adventureDate]);

    useEffect(() => {
        let isMounted = true;

        async function loadReminder() {
            try {
                const storedReminder = await getAdventureReminder(adventureId);

                if(isMounted) {
                    setReminder(storedReminder);
                }
            }
            finally {
                if(isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadReminder();

        return () => {
            isMounted = false;
        }
    }, [adventureId]);

    async function selectReminder(option: ReminderOption) {
        if(option.reminderAt.getTime() <= Date.now()) {
            Alert.alert("Reminder time has passed", "Choose a later reminder option.");

            return;
        }

        try {
            setIsWorking(true);

            const scheduledReminder = await scheduleAdventureReminder({
                adventureId,
                adventureTitle,
                reminderAt: option.reminderAt
            });

            setReminder(scheduledReminder);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "AdventureLog could not schedule this reminder.";

            Alert.alert("Reminder not scheduled", message);
        }
        finally {
            setIsWorking(false);
        }
    }

    async function cancelReminder() {
        try {
            setIsWorking(true);

            await cancelAdventureReminder(adventureId);

            setReminder(null);
        }
        catch {
            Alert.alert("Reminder not canceled", "AdventureLog could not cancel this reminder.");
        }
        finally {
            setIsWorking(false);
        }
    }

    if(isLoading) {
        return(
            <View style={styles.card}>
                <ActivityIndicator size="small" color={colors.forest} />
            </View>
        );
    }

    return(
        <View style={styles.card}>
            <View style={styles.headingRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name="notifications-outline" size={22} color={colors.clay} />
                </View>

                <View style={styles.headingContent}>
                    <Text style={styles.title}>
                        Adventure reminder
                    </Text>

                    <Text style={styles.description}>
                        Get a local reminder before this adventure.
                    </Text>
                </View>
            </View>

            {reminder ? (
                <View style={styles.activeReminder}>
                    <View style={styles.activeReminderText}>
                        <Text style={styles.activeLabel}>
                            Reminder set
                        </Text>

                        <Text style={styles.activeDate}>
                            {formatReminderDate(reminder.reminderAt)}
                        </Text>
                    </View>

                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
            ): null}

            <View style={styles.options}>
                {reminderOptions.map((option) => {
                    const hasPassed = option.reminderAt.getTime() <= Date.now();

                    return(
                        <Pressable
                            key={option.id}
                            accessibilityRole="button"
                            disabled={isWorking || hasPassed}
                            onPress={() => void selectReminder(option)}
                            style={({pressed}) => [styles.option, pressed && !isWorking && !hasPassed && styles.pressed, hasPassed && styles.optionDisabled]}
                        >
                            <View style={styles.optionText}>
                                <Text style={styles.optionLabel}>
                                    {option.label}
                                </Text>

                                <Text style={styles.optionDescription}>
                                    {hasPassed ? "Time passed" : `${formatReminderDate(option.reminderAt)}`}
                                </Text>
                            </View>

                            {isWorking ? (
                                <ActivityIndicator size="small" color={colors.forest} />
                            ): (
                                <Ionicons name="chevron-forward" size={18} color={hasPassed ? colors.textMuted : colors.forest} />
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {reminder ? (
                <Pressable
                    accessibilityRole="button"
                    disabled={isWorking}
                    onPress={() => void cancelReminder()}
                    style={({pressed}) => [styles.cancelButton, pressed && styles.pressed]}
                >
                    <Ionicons name="close-circle-outline" size={17} color={colors.danger} />

                    <Text style={styles.cancelText}>
                        Cancel reminder
                    </Text>
                </Pressable>
            ): null}
        </View>
    );
}

function createStyles(colors: AppColors) {
    return StyleSheet.create({
        card: {
            marginTop: spacing.xl,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 22
        },
        headingRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        iconContainer: {
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 17
        },
        headingContent: {
            flex: 1,
        },
        title: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: "800"
        },
        description: {
            marginTop: 3,
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 17
        },
        activeReminder: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.lg,
            padding: spacing.md,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 16
        },
        activeReminderText: {
            flex: 1,
        },
        activeLabel: {
            color: colors.success,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.8,
            textTransform: "uppercase"
        },
        activeDate: {
            marginTop: 3,
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "700"
        },
        options: {
            gap: spacing.sm,
            marginTop: spacing.lg,
        },
        option: {
            minHeight: 58,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16
        },
        optionDisabled: {
            opacity: 0.45
        },
        optionText: {
            flex: 1,
        },
        optionLabel: {
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "800"
        },
        optionDescription: {
            marginTop: 2,
            color: colors.textSecondary,
            fontSize: 11
        },
        cancelButton: {
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            marginTop: spacing.lg,
        },
        cancelText: {
            color: colors.danger,
            fontSize: 12,
            fontWeight: "800"
        },
        pressed: {
            opacity: 0.72
        }
    });
}