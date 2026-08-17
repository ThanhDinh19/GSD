function mapSqlType(type) {
    const name = type?.name?.toLowerCase();

    if (
        [
            'int',
            'bigint',
            'smallint',
            'tinyint',
            'decimal',
            'numeric',
            'float',
            'real',
            'money',
            'smallmoney',
        ].includes(name)
    ) {
        return 'number';
    }

    if (
        [
            'date',
            'datetime',
            'datetime2',
            'smalldatetime',
            'datetimeoffset',
            'time',
        ].includes(name)
    ) {
        return 'datetime';
    }

    if (name === 'bit') {
        return 'boolean';
    }

    return 'string';
}

module.exports = {
    mapSqlType
}