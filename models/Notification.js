module.exports = (sequelize, Datatypes) => {
    const Notification = sequelize.define("Notification", {
        content: {
            type: Datatypes.STRING,
            allowNull: false
        }

    });

    Notification.associate = models => {
        Notification.belongsTo(models.Consultant, {
            foreignKey: {
                as: 'consultant_id',
                allowNull: false
            },
            constraints: false,
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        Notification.belongsTo(models.Linemanager, {
            foreignKey: {
                as: 'manager_id',
                allowNull: false
            },
            constraints: false,
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    }

    return Notification
}