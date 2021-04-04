module.exports = (sequelize, Datatypes) => {
    const Linemanager = sequelize.define("Linemanager",{
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
            defaultValue:2
        }

    });
    Linemanager.associate = models =>{
        Linemanager.hasMany(models.Consultant,{
            onUpdate: 'cascade',
            onDelete: 'cascade'
        });
        Linemanager.hasMany(models.Week,{
            onUpdate: 'cascade',
            onDelete: 'cascade'
        });
        Linemanager.hasMany(models.Notification,{
            onUpdate: 'cascade',
            onDelete: 'cascade'
        });
    };


    return Linemanager
}