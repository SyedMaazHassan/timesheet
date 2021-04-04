module.exports = (sequelize, Datatypes) => {
    const Feedback = sequelize.define("Feedback", {
        content: {
            type: Datatypes.STRING,
            allowNull: false
        },
        timestamp: {
            type: Datatypes.STRING,
            allowNull: false
        }

    });

    Feedback.associate = models => {
        Feedback.belongsTo(models.Week, {
            foreignKey: {
                as: 'week_id',
                allowNull: false
            },
            constraints: false,
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    }
    return Feedback
}