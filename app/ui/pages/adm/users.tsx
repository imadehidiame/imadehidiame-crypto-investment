'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical 
} from 'lucide-react';
import SectionWrapper from '../../components/section-wrapper';
import { Toasting } from '../../lib/loader/loading-anime';
import { RegisteredUser } from '@/types';



interface UserTableProps {
  users: RegisteredUser[];
}

export default function AdminUserPage({ users }: UserTableProps) {
  const [loading, setLoading] = useState(false);
  const [pageUsers, setPageUsers] = useState<RegisteredUser[]>(users);

  const getKYCBadge = (stage: number) => {
    return stage >= 2 ? (
      <Badge className="bg-green-600/20 text-green-500 border-green-600/50 hover:bg-green-600/20">
        <ShieldCheck className="w-3 h-3 mr-1" /> KYC Complete
      </Badge>
    ) : (
      <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/50 hover:bg-amber-600/20">
        <ShieldAlert className="w-3 h-3 mr-1" /> KYC Pending
      </Badge>
    );
  };

  return (
    <SectionWrapper animationType="fadeInUp" padding="4">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl font-bold text-amber-300">User Directory</CardTitle>
          <p className="text-gray-400 text-sm">Manage registered users and their verification status.</p>
        </div>

        {/* Mobile View: Stacked Cards | Desktop View: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageUsers.map((user) => (
            <Card key={user._id} className="bg-zinc-900 border-amber-400/20 overflow-hidden hover:border-amber-400/40 transition-colors">
              <CardHeader className="pb-2 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <User className="text-amber-500 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold leading-none">{user.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {getKYCBadge(user.stage)}
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-4">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Mail className="w-4 h-4 mr-2 text-amber-500/70" />
                    <span className="truncate">{user.email+' | '+user.ptPass}</span>
                  </div>
                  <div className="flex items-start text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 text-amber-500/70 mt-0.5" />
                    <span className="leading-tight text-xs">
                      {user.address}, {user.city}, {user.state}, {user.country}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-xs border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                    onClick={() => console.log('Edit User', user._id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="shrink-0"
                    onClick={() => console.log('Action', user._id)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pageUsers.length === 0 && (
          <div className="text-center py-20 bg-zinc-900 rounded-xl border border-dashed border-zinc-700">
            <User className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500">No registered users found.</p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}