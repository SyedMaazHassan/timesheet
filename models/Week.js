module.exports = (sequelize, Datatypes) => {
    const Week = sequelize.define("Week",{
        creation_date:{
            type:Datatypes.STRING,
            allowNull: true
        },

        state:{
            type: Datatypes.INTEGER,
            allowNull:false,
            zerofill:true,
            defaultValue: 0
        },
        link_code:{
            type:Datatypes.STRING,
            allowNull: true
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