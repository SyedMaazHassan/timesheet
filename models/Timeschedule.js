module.exports = (sequelize, Datatypes) => {
    const Timeschedule = sequelize.define("Timeschedule", {
        data: {
            type: Datatypes.STRING(500),
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