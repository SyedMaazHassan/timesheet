module.exports = (sequelize, Datatypes) => {
    const Consultant = sequelize.define("Consultant",{
        name:{
            type:Datatypes.STRING,
            allowNull: false
        },
        email:{
            type:Datatypes.STRING,
            allowNull: false
        },
        password:{
            type:Datatypes.STRING,
            allowNull: false
        },
        phone:{
            type: Datatypes.INTEGER,
            allowNull:false
        },
        role:{
            type: Datatypes.INTEGER,
            defaultValue:3
        }

    });

    Consultant.associate = models =>{
        Consultant.hasMany(models.Week,{
            onUpdate: 'cascade',
            onDelete: 'cascade'
        });
        Consultant.hasMany(models.Notification,{
            onUpdate: 'cascade',
            onDelete: 'cascade'
        });
        Consultant.belongsTo(models.Linemanager,{
            foreignKey:{
                as: 'linemanager_id',
                allowNull:false
            },
            constraints:false,
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    };

    return Consultant
}