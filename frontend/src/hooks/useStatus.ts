import { useEffect, useState } from 'react';
import {
    MasterStatus
} from '../types'

import {
    statusService
} from '../services/status.service';

export function useStatuses() {
    const [statuses, setStatuses] = useState<MasterStatus[]>([]);

    const loadStatuses = async() => {
        const data = await statusService.getStatuses();
        setStatuses(data);
    }

    useEffect(() =>{
        loadStatuses();
    }, [])

    return {
        statuses,
        loadStatuses
    }
}