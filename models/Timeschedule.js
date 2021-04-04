module.exports = (sequelize, Datatypes) => {
    const Timeschedule = sequelize.define("Timeschedule", {
        from_time: {
            type: Datatypes.STRING,
            allowNull: false
        },
        to_time: {
            type: Datatypes.STRING,
            allowNull: false
        },
        day: {
            type: Datatypes.STRING,
            allowNull: false
        },
        total_hours: {
            type: Datatypes.INTEGER,
            allowNull: false
        }
    });

    Timeschedule.associate = models => {
        Timeschedule.belongsTo(models.Week, {
            foreignKey: {
                as: 'week_id',
                allowNull: false
            },
            constraints: false,
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    }
    return Timeschedule
}