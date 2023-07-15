type ProjectInfo = {
  id: string;
  name: string;
  createAt?: string;
  updateAt?: string;
  userId?: string;
}

interface ProjectListProps {
  onSelect:(item?:ProjectInfo)=>void
}