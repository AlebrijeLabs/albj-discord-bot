const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Initialize database
const db = new sqlite3.Database('./data/user_engagement.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    }
    console.log('Engagement database connected');
});

// Create tables if not exists
db.run(`CREATE TABLE IF NOT EXISTS user_checkins (
    user_id TEXT PRIMARY KEY,
    last_checkin DATE,
    streak INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS user_notifications (
    user_id TEXT PRIMARY KEY,
    price_alerts BOOLEAN DEFAULT 0,
    daily_updates BOOLEAN DEFAULT 0,
    event_reminders BOOLEAN DEFAULT 0
)`);

async function handleCheckIn(interaction) {
    const userId = interaction.user.id;
    const today = new Date().toISOString().split('T')[0];

    db.get(`SELECT * FROM user_checkins WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            console.error(err);
            return interaction.editReply({ content: 'Error processing check-in', ephemeral: true });
        }

        if (!row) {
            // First time check-in
            db.run(`INSERT INTO user_checkins (user_id, last_checkin, streak, total_points) VALUES (?, ?, 1, 10)`, 
                [userId, today], (err) => {
                    if (err) console.error(err);
                    interaction.editReply({ 
                        content: '🎉 First check-in! Welcome to the ALBJ daily spirit journey!', 
                        ephemeral: true 
                    });
                }
            );
        } else {
            const lastCheckin = new Date(row.last_checkin);
            const today = new Date();
            const daysDiff = (today - lastCheckin) / (1000 * 3600 * 24);

            let newStreak = row.streak;
            let newPoints = row.total_points;

            if (daysDiff <= 1) {
                newStreak += 1;
                newPoints += 5;
            } else if (daysDiff > 1) {
                newStreak = 1;
            }

            db.run(`UPDATE user_checkins SET last_checkin = ?, streak = ?, total_points = ? WHERE user_id = ?`, 
                [today, newStreak, newPoints, userId], (err) => {
                    if (err) console.error(err);
                    interaction.editReply({ 
                        content: `🔥 Daily Check-in Streak: ${newStreak} days\n💎 Total Points: ${newPoints}`, 
                        ephemeral: true 
                    });
                }
            );
        }
    });
}

async function handleMyStats(interaction) {
    const userId = interaction.user.id;

    db.get(`SELECT * FROM user_checkins WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            console.error(err);
            return interaction.editReply({ content: 'Error retrieving stats', ephemeral: true });
        }

        if (!row) {
            return interaction.editReply({ 
                content: '📊 No stats available. Start your daily check-ins!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${interaction.user.username}'s ALBJ Stats`)
            .setColor('#00ff88')
            .addFields(
                { name: '🔥 Check-in Streak', value: `${row.streak} days`, inline: true },
                { name: '💎 Total Points', value: `${row.total_points}`, inline: true },
                { name: '📅 Last Check-in', value: row.last_checkin, inline: true }
            )
            .setFooter({ text: 'Keep engaging to earn more points!' });

        interaction.editReply({ embeds: [embed], ephemeral: true });
    });
}

async function handleNotifications(interaction) {
    const userId = interaction.user.id;

    db.get(`SELECT * FROM user_notifications WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            console.error(err);
            return interaction.editReply({ content: 'Error retrieving notifications', ephemeral: true });
        }

        const notificationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('toggle_price_alerts')
                    .setLabel(`Price Alerts: ${row?.price_alerts ? 'ON' : 'OFF'}`)
                    .setStyle(row?.price_alerts ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('toggle_daily_updates')
                    .setLabel(`Daily Updates: ${row?.daily_updates ? 'ON' : 'OFF'}`)
                    .setStyle(row?.daily_updates ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('toggle_event_reminders')
                    .setLabel(`Event Reminders: ${row?.event_reminders ? 'ON' : 'OFF'}`)
                    .setStyle(row?.event_reminders ? ButtonStyle.Success : ButtonStyle.Danger)
            );

        interaction.editReply({ 
            content: '🔔 Manage your ALBJ Token notification preferences:', 
            components: [notificationRow],
            ephemeral: true 
        });
    });
}

module.exports = {
    handleCheckIn,
    handleMyStats,
    handleNotifications
}; 