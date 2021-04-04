module.exports = (sequelize, Datatypes) => {
    const Week = sequelize.define("Week",{
        month:{
            type:Datatypes.INTEGER,
            allowNull: false
        },
        number:{
            type:Datatypes.STRING,
            allowNull: false
        },
        creation_date:{
            type:Datatypes.STRING,
            allowNull: false
        },

        state:{
            type: Datatypes.INTEGER,
            allowNull:false
        },
        link_code:{
            type:Datatypes.STRING,
            allowNull: false
        }
    });

    Week.associate = models =>{
        Week.belongsTo(models.Consultant,{
            foreignKey:{
                as: 'created_by',
                allowNull:false
            },
            constraints:false,
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        Week.belongsTo(models.Linemanager,{
                foreignKey:{
                    as: 'reviewed_by',
                    allowNull:false
                },
                constraints:false,
                onDelete: 'cascade',
                onUpdate: 'cascade'
            });
        Week.hasMany(models.Feedback,{
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        Week.hasMany(models.Timeschedule,{
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    };


    return Week
}